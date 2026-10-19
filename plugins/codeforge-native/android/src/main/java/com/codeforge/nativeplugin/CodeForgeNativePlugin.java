package com.codeforge.nativeplugin;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;

import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import org.json.JSONObject;

@CapacitorPlugin(name = "CodeForgeNative")
public class CodeForgeNativePlugin extends Plugin {
    private static final String PREFS = "codeforge_native";
    private static final String FOLDER_URI = "folder_uri";

    @PluginMethod
    public void openCodeServer(PluginCall call) {
        String url = call.getString("url", "http://127.0.0.1:8080");
        if (url == null || !(url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost") || url.startsWith("https://"))) {
            call.reject("Use the local code-server URL (127.0.0.1/localhost) or a trusted HTTPS URL.");
            return;
        }
        try {
            Intent intent = new Intent(getContext(), CodeServerActivity.class);
            intent.putExtra("url", url);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open the in-app code-server: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void pickDirectory(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(call, intent, "handleDirectoryResult");
    }

    @ActivityCallback
    private void handleDirectoryResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Folder selection was cancelled.");
            return;
        }
        Uri uri = result.getData().getData();
        try {
            int flags = result.getData().getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            getContext().getContentResolver().takePersistableUriPermission(uri, flags);
        } catch (Exception ignored) {
            // Some providers do not expose persistable grants. The current grant is still usable.
        }
        getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(FOLDER_URI, uri.toString()).apply();
        JSObject ret = new JSObject();
        ret.put("path", uri.toString());
        call.resolve(ret);
    }

    @PluginMethod
    public void getDirectory(PluginCall call) {
        String value = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(FOLDER_URI, null);
        JSObject ret = new JSObject();
        ret.put("path", value == null ? JSONObject.NULL : value);
        call.resolve(ret);
    }

    @PluginMethod
    public void writeFiles(PluginCall call) {
        String value = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(FOLDER_URI, null);
        if (value == null) { call.reject("No workspace folder has been selected."); return; }
        DocumentFile tree = DocumentFile.fromTreeUri(getContext(), Uri.parse(value));
        if (tree == null || !tree.canWrite()) { call.reject("The selected workspace folder is no longer writable. Choose it again in Settings."); return; }
        JSArray files = call.getArray("files");
        if (files == null) { call.reject("No files were provided."); return; }
        int count = 0;
        try {
            for (int i = 0; i < files.length(); i++) {
                JSONObject item = files.getJSONObject(i);
                String name = item.optString("name", "file.txt").replaceAll("[\\\\/:*?\"<>|]", "_");
                String content = item.optString("content", "");
                DocumentFile existing = tree.findFile(name);
                if (existing != null) existing.delete();
                DocumentFile target = tree.createFile(mimeFor(name), name);
                if (target == null) throw new IllegalStateException("Could not create " + name);
                try (OutputStream out = getContext().getContentResolver().openOutputStream(target.getUri(), "w")) {
                    if (out == null) throw new IllegalStateException("Could not open " + name);
                    out.write(content.getBytes(StandardCharsets.UTF_8));
                    out.flush();
                }
                count++;
            }
            JSObject ret = new JSObject();
            ret.put("count", count);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Save failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void openPreview(PluginCall call) {
        String html = call.getString("html", "");
        try {
            File file = new File(getContext().getCacheDir(), "codeforge-preview.html");
            try (FileOutputStream out = new FileOutputStream(file, false)) {
                out.write(html.getBytes(StandardCharsets.UTF_8));
            }
            String authority = getContext().getPackageName() + ".codeforge.fileprovider";
            Uri uri = FileProvider.getUriForFile(getContext(), authority, file);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "text/html");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            if (isPackageInstalled("com.android.chrome")) {
                intent.setPackage("com.android.chrome");
            }
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open browser preview: " + e.getMessage(), e);
        }
    }

    private boolean isPackageInstalled(String packageName) {
        try { getContext().getPackageManager().getPackageInfo(packageName, 0); return true; }
        catch (Exception ignored) { return false; }
    }

    private String mimeFor(String name) {
        String n = name.toLowerCase();
        if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html";
        if (n.endsWith(".css")) return "text/css";
        if (n.endsWith(".js")) return "text/javascript";
        if (n.endsWith(".json")) return "application/json";
        if (n.endsWith(".xml")) return "application/xml";
        if (n.endsWith(".md")) return "text/markdown";
        return "text/plain";
    }
}
