package com.codeforge.nativeplugin;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

/** Landscape, desktop-oriented WebView for the Termux code-server UI. */
public class CodeServerActivity extends Activity {
    private WebView webView;
    private TextView status;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(24, 24, 24));
        webView = new WebView(this);
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        // Touchscreen taps are intentionally ignored: this workspace is designed for a physical mouse/trackpad and keyboard.
        webView.setOnTouchListener((view, event) -> (event.getSource() & InputDevice.SOURCE_TOUCHSCREEN) == InputDevice.SOURCE_TOUCHSCREEN);
        webView.setBackgroundColor(Color.rgb(24, 24, 24));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setLoadsImagesAutomatically(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setDefaultTextEncodingName("UTF-8");
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        String ua = settings.getUserAgentString();
        settings.setUserAgentString(ua + " CodeForgeDesktop/1.0");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Keep code-server navigation in this activity. Block accidental external-app handoff.
                return !(url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost") || url.startsWith("https://"));
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (status != null) status.setVisibility(View.GONE);
                view.requestFocus();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                if (request.isForMainFrame() && status != null) {
                    status.setVisibility(View.VISIBLE);
                    status.setText("Cannot connect to code-server. Start it in Termux, then press Reload.\n\n" + error.getDescription());
                }
            }
        });
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        status = new TextView(this);
        status.setTextColor(Color.WHITE);
        status.setTextSize(16);
        status.setPadding(32, 24, 32, 24);
        status.setBackgroundColor(Color.rgb(35, 35, 35));
        status.setText("Connecting to Termux code-server…");
        root.addView(status, new FrameLayout.LayoutParams(-1, -2));
        setContentView(root);
        String url = getIntent().getStringExtra("url");
        if (url == null || url.isEmpty()) url = "http://127.0.0.1:8080";
        webView.loadUrl(url);
    }

    @Override public boolean dispatchKeyEvent(KeyEvent event) {
        // Preserve desktop keyboard shortcuts in the embedded editor.
        if (webView != null && event.getAction() == KeyEvent.ACTION_DOWN && event.isCtrlPressed()) {
            int key = event.getKeyCode();
            if (key == KeyEvent.KEYCODE_W || key == KeyEvent.KEYCODE_T || key == KeyEvent.KEYCODE_N) return true;
        }
        return super.dispatchKeyEvent(event);
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (webView != null) { webView.stopLoading(); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
