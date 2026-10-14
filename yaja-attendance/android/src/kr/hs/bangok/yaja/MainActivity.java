package kr.hs.bangok.yaja;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

/**
 * 야자 출석 웹 앱(Google Apps Script)을 크롬 맞춤 탭으로 여는 안드로이드 앱.
 * 구글은 앱 내장 웹뷰에서의 로그인을 막기 때문에, 웹뷰 대신 크롬 맞춤 탭을 씁니다.
 */
public class MainActivity extends Activity {
    private static final String PREFS = "yaja";
    private static final String KEY_URL = "url";

    private static final int NAVY = 0xFF1F3A68;
    private static final int IVORY = 0xFFF8F6F1;
    private static final int WHITE = 0xFFFFFFFF;
    private static final int INK = 0xFF1A2233;
    private static final int SUB = 0xFF6B6F7A;
    private static final int HERO_SUB = 0xFFB8C4DA;
    private static final int BORDER = 0xFFD9D3C5;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(NAVY);
        String url = savedUrl();
        if (isValid(url)) {
            showHome(url);
            if (state == null) openWebApp(url);
        } else {
            showSetup(url);
        }
    }

    private String savedUrl() {
        return getSharedPreferences(PREFS, MODE_PRIVATE)
                .getString(KEY_URL, getString(R.string.default_url)).trim();
    }

    static boolean isValid(String url) {
        return url != null && url.startsWith("https://script.google.com/");
    }

    private void openWebApp(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        // 크롬 맞춤 탭 요청: androidx.browser 라이브러리 없이 같은 extra 를 직접 넣습니다.
        Bundle extras = new Bundle();
        extras.putBinder("android.support.customtabs.extra.SESSION", null);
        intent.putExtras(extras);
        intent.putExtra("android.support.customtabs.extra.TOOLBAR_COLOR", NAVY);
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "웹 브라우저를 찾을 수 없습니다. 크롬을 설치하세요.", Toast.LENGTH_LONG).show();
        }
    }

    // ───────────── 화면 ─────────────

    private void showHome(final String url) {
        LinearLayout body = page("꾸준함이 실력이 됩니다");
        body.addView(text("학교 구글 계정으로 로그인한 크롬에서 열립니다.", 14, SUB, false));
        body.addView(button("출석 앱 열기", NAVY, WHITE, new View.OnClickListener() {
            @Override public void onClick(View v) { openWebApp(savedUrl()); }
        }), buttonParams(24));

        TextView change = text("웹 앱 주소 변경", 14, NAVY, true);
        change.setPadding(0, dp(20), 0, dp(4));
        change.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { showSetup(savedUrl()); }
        });
        body.addView(change);

        TextView current = text(url, 12, SUB, false);
        current.setSingleLine(true);
        current.setEllipsize(TextUtils.TruncateAt.MIDDLE);
        body.addView(current);
    }

    private void showSetup(String current) {
        LinearLayout body = page("처음 한 번만 설정하면 됩니다");
        body.addView(text("웹 앱 주소", 15, INK, true));

        final EditText input = new EditText(this);
        input.setHint("https://script.google.com/macros/s/…/exec");
        input.setText(current);
        input.setSingleLine(true);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        input.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        input.setTextColor(INK);
        input.setPadding(dp(12), dp(12), dp(12), dp(12));
        input.setBackground(rounded(WHITE, BORDER, 10));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);
        lp.topMargin = dp(8);
        body.addView(input, lp);

        body.addView(button("클립보드에서 붙여넣기", WHITE, NAVY, new View.OnClickListener() {
            @Override public void onClick(View v) {
                ClipboardManager cm = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                ClipData clip = cm == null ? null : cm.getPrimaryClip();
                if (clip != null && clip.getItemCount() > 0 && clip.getItemAt(0).getText() != null) {
                    input.setText(clip.getItemAt(0).getText().toString().trim());
                } else {
                    Toast.makeText(MainActivity.this, "복사한 주소가 없습니다.", Toast.LENGTH_SHORT).show();
                }
            }
        }), buttonParams(12));

        TextView help = text("선생님께 받은 주소(https://script.google.com/…/exec)를 붙여넣으세요.", 12, SUB, false);
        help.setPadding(0, dp(12), 0, 0);
        body.addView(help);

        body.addView(button("저장하고 열기", NAVY, WHITE, new View.OnClickListener() {
            @Override public void onClick(View v) {
                String url = input.getText().toString().trim();
                if (!isValid(url)) {
                    Toast.makeText(MainActivity.this, "https://script.google.com/ 으로 시작하는 주소를 넣으세요.", Toast.LENGTH_LONG).show();
                    return;
                }
                getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEY_URL, url).apply();
                showHome(url);
                openWebApp(url);
            }
        }), buttonParams(24));
    }

    /** 남색 머리글이 있는 화면 틀을 만들고, 내용을 넣을 영역을 돌려줍니다. */
    private LinearLayout page(String subtitle) {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.VERTICAL);
        header.setBackgroundColor(NAVY);
        header.setPadding(dp(24), dp(32), dp(24), dp(24));
        header.addView(text("야자 출석", 24, WHITE, true));
        TextView sub = text(subtitle, 14, HERO_SUB, false);
        sub.setPadding(0, dp(4), 0, 0);
        header.addView(sub);
        root.addView(header, new LinearLayout.LayoutParams(-1, -2));

        LinearLayout body = new LinearLayout(this);
        body.setOrientation(LinearLayout.VERTICAL);
        body.setPadding(dp(20), dp(24), dp(20), dp(24));
        root.addView(body, new LinearLayout.LayoutParams(-1, -2));

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(IVORY);
        scroll.addView(root);
        setContentView(scroll);
        return body;
    }

    private TextView text(String s, int sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private Button button(String label, int bg, int fg, View.OnClickListener onClick) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        b.setTypeface(Typeface.DEFAULT_BOLD);
        b.setTextColor(fg);
        b.setGravity(Gravity.CENTER);
        b.setBackground(rounded(bg, bg == WHITE ? NAVY : bg, 12));
        b.setStateListAnimator(null);
        b.setOnClickListener(onClick);
        return b;
    }

    private LinearLayout.LayoutParams buttonParams(int topDp) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(52));
        lp.topMargin = dp(topDp);
        return lp;
    }

    private GradientDrawable rounded(int fill, int stroke, int radiusDp) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(fill);
        g.setCornerRadius(dp(radiusDp));
        g.setStroke(dp(1), stroke);
        return g;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
