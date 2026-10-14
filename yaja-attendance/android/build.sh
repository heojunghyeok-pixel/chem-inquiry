#!/usr/bin/env bash
# 야자 출석 안드로이드 앱(APK) 빌드
# 사용법: ./build.sh [웹앱주소]
#   웹앱주소를 주면 앱에 미리 넣고, 비우면 앱을 처음 열 때 입력받습니다.
# 필요: JDK, Ubuntu 패키지 aapt dalvik-exchange zipalign apksigner android-sdk-platform-23
set -euo pipefail
cd "$(dirname "$0")"

URL="${1:-}"
SDK=/usr/lib/android-sdk
JAR="$SDK/platforms/android-23/android.jar"
DX="$SDK/build-tools/debian/dx"
KS="${KEYSTORE:-yaja-release.keystore}"
KS_PASS="${KEYSTORE_PASS:-yaja-attendance}"
OUT=build

rm -rf "$OUT"
mkdir -p "$OUT/gen" "$OUT/classes"
cp -r res "$OUT/res"
if [ -n "$URL" ]; then
  python3 - "$OUT/res/values/strings.xml" "$URL" <<'PY'
import sys
from xml.sax.saxutils import escape
path, url = sys.argv[1], sys.argv[2]
s = open(path, encoding="utf-8").read()
s = s.replace('<string name="default_url"></string>', '<string name="default_url">%s</string>' % escape(url).replace("'", "\\'"))
open(path, "w", encoding="utf-8").write(s)
PY
fi

aapt package -f -m -J "$OUT/gen" -M AndroidManifest.xml -S "$OUT/res" -I "$JAR" -F "$OUT/unsigned.apk"
javac -source 8 -target 8 -Xlint:-options -encoding UTF-8 -bootclasspath "$JAR" -d "$OUT/classes" \
  $(find src "$OUT/gen" -name '*.java')
"$DX" --dex --output="$OUT/classes.dex" "$OUT/classes"
(cd "$OUT" && aapt add -f unsigned.apk classes.dex >/dev/null)
zipalign -f 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

if [ ! -f "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -alias yaja -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$KS_PASS" -keypass "$KS_PASS" -dname "CN=Yaja Attendance, O=Bangok High School, C=KR"
fi
apksigner sign --ks "$KS" --ks-pass "pass:$KS_PASS" --out yaja-attendance.apk "$OUT/aligned.apk"
apksigner verify yaja-attendance.apk
echo "완료: $(pwd)/yaja-attendance.apk"
