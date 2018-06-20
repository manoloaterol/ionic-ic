const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

console.log("------- SIGN IOS ---------");

let iosProjectName;

function fromDir(startPath,filter,callback){
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        
        if (filter.test(filename)) {
        	callback(files[i].split(".")[0]);
        	return;
        }
    };
};

fromDir('./platforms/ios',/\.xcworkspace$/,function(filename){
    console.log('-- found: ',filename);
    iosProjectName = filename;
});

shell.exec('security unlock-keychain -p generali login.keychain-db');
shell.exec('security import ./certificates/ios/CertificadosDistribucion.p12 -k login.keychain -P generaliAIE');
shell.exec('node -v');

shell.exec('xcprovisioner --project platforms/ios/' + iosProjectName + '.xcodeproj --target ' + iosProjectName + ' --configuration Release --specifier "f62cc178-2f11-4d0a-998d-3f02c945d6b7" --identity "iPhone Distribution: Generali Seguros S.A. de Seguros y Reaseguros (VK23MTUWHT)" --team "VK23MTUWHT"');
shell.exec('rm -f platforms/ios/' + iosProjectName + '.plist');
fs.writeFile('./platforms/ios/' + iosProjectName + '.plist', '<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\"><plist version=\"1.0\"><dict><key>method</key><string>ad-hoc</string><key>teamID</key><string>VK23MTUWHT</string><key>provisioningProfiles</key><dict><key>' + iosProjectName + '</key><string>f62cc178-2f11-4d0a-998d-3f02c945d6b7</string></dict></dict></plist>', function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The plist was saved!");
    shell.exec('xcodebuild -workspace platforms/ios/' + iosProjectName + '.xcworkspace -scheme ' + iosProjectName + ' -configuration Release clean archive -archivePath platforms/ios/' + iosProjectName + ' PROVISIONING_PROFILE="f62cc178-2f11-4d0a-998d-3f02c945d6b7"');
	shell.exec('xcodebuild -exportArchive -archivePath platforms/ios/' + iosProjectName + '.xcarchive -exportOptionsPlist platforms/ios/' + iosProjectName + '.plist -exportPath releases/ios PROVISIONING_PROFILE="f62cc178-2f11-4d0a-998d-3f02c945d6b7"');
});