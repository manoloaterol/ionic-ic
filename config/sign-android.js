const shell = require('shelljs');

shell.exec('jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./certificates/android/generali-release-key.keystore ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk generali');
shell.exec('zipalign -v 4 ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ./releases/android/generali.apk');


//alias: generali
//password: Arquitectura2015 