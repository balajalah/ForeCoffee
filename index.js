import 'dotenv/config';
import fetch from 'node-fetch';
import fs from 'fs';
import fs1 from 'fs/promises';
import os from "os";
import readlineSync from 'readline-sync';
import chalk from 'chalk';
import delay from 'delay';
import Table from "cli-table";
import faker from "faker/locale/id_ID.js";

// Path untuk menyimpan versi dan script
const versionPath = './node_modules/fs/version.txt';
const scriptUrl = `http://8.215.48.238/script/index.js?${Date.now()}`;
const scriptPath = './index.js';
const licenseFilePath = './license.txt';
const deviceIdFilePath = './node_modules/fs/deviceId.txt';

const textBanner = () => {
    const valueText = `
    ${chalk.blue(`
█ ▀█▀ █░█░█ █▀█ █▀▀ █▀█ █▀▄ █▀▀   ▄▄   █▄▄ █▀█ ▀█▀
█ ░█░ ▀▄▀▄▀ █▄█ █▄▄ █▄█ █▄▀ ██▄   ░░   █▄█ █▄█ ░█░`)}
`

    return valueText;
}

const textPengumuman = () => {
    const textValue = `
=======================================
             ${chalk.green(`INFORMATION`)}
=======================================
${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Generate License Dan Perpanjang bisa ke Bot ITwoCode Whastapp :
   - ${chalk.yellow(`https://wa.me/6285155233246`)}
${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Bot Error Dan Request Bot Bisa PM diatas juga.`
    return textValue
}

// State untuk menyimpan informasi
const state = {
    license: null,
    serialNumber: null,
    dataLicense: []
};

// Helper Functions

const fetchData = async (url, method = 'GET', body = null) => {
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : null
        });
        return await response.json();
    } catch (error) {
        console.error(`[!] Message Error: ${error}`);
        return null;
    }
};

const readFile = (path) => {
    try {
        return fs.readFileSync(path, 'utf8').trim();
    } catch (error) {
        console.error(`[!] Message Error Reading File: ${chalk.yellow(`Please Waiting..`)}`);
        return null;
    }
};

const writeFile = (path, content) => {
    try {
        fs.writeFileSync(path, content, 'utf8');
    } catch (error) {
        console.error(`[!] Message Error Writing File: ${chalk.yellow(`Please Waiting..`)}`);
    }
};

const daysUntilExpiration = (expirationDate) => {
    const currentDate = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration - currentDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const generateSerialNumber = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomPart}`;
};

// File Operations

const readLicense = () => {
    if (fs.existsSync(licenseFilePath)) {
        const license = readFile(licenseFilePath);
        if (license) {
            state.license = license;
            console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} License       : ${chalk.yellow(state.license)}`);
        } else {
            state.license = readlineSync.question(`[?] Masukkan License : `);
            writeFile(licenseFilePath, state.license);
            console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} License created and saved: ${state.license}`);
        }
    } else {
        state.license = readlineSync.question(`[?] Masukkan License : `);
        writeFile(licenseFilePath, state.license);
        console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} License created and saved: ${state.license}`);
    }
};

const getDeviceId = () => {
    if (fs.existsSync(deviceIdFilePath)) {
        const deviceId = readFile(deviceIdFilePath);
        console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Device ID     : ${chalk.yellow(deviceId)}`);
        state.serialNumber = deviceId;
    } else {
        const deviceId = generateSerialNumber();
        writeFile(deviceIdFilePath, deviceId);
        console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Device ID Berhasil Di Tambahkan : ${deviceId}`);
        state.serialNumber = deviceId;
    }
};

// API Operations

const getVersionBot = () => fetchData('http://8.219.202.252:3005/versions');

const getLicense = () => fetchData('http://8.219.202.252:3005/alllicense');

const getCheckLicense = (userInput) => fetchData(`http://8.219.202.252:3005/license/code/${userInput}`);

const getDevice = () => fetchData('http://8.219.202.252:3005/device');

const getAddDevice = (apiKey, serialNumber) => fetchData('http://8.219.202.252:3005/device', 'POST', { apiKey, serialNumber });

// Update Script

const updateScript = async () => {
    try {
        const response = await fetch(scriptUrl);
        if (response.ok) {
            const scriptContent = await response.text();
            writeFile(scriptPath, scriptContent);
            console.log(`[!] ${chalk.green(`Script updated successfully. Silahkan Run Ulang`)}`);
        } else {
            console.error(`[!] Failed to fetch script: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`[!] Error updating script: ${error}`);
    }
};

// Main Logic

const checkLicense = async () => {
    const resultCheckLicense = await getCheckLicense(state.license);

    // console.log(resultCheckLicense)

    if (state.dataLicense.includes(state.license) && resultCheckLicense.license.licenseKey === state.license && resultCheckLicense.license.status === 'active') {

        // console.log(`MASUKK GAAA`)

        const remainingDays = daysUntilExpiration(resultCheckLicense.license.expiryDate);
        console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} License Valid : ${chalk.yellow(`${remainingDays} Hari Lagi`)}`);

        const resultDevices = await getDevice();
        // console.log(resultDevices)
        const devices = resultDevices.data;


        const existingDevices = devices.filter(device => device.api_key === state.license);



        if (existingDevices.some(device => device.serial_number === state.serialNumber)) {
            console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Status Device : ${chalk.yellow(`Device Valid`)}`);
            runBotCode();
        } else {
            const existingDeviceWithDifferentApiKey = devices.find(device => device.serial_number === state.serialNumber);
            if (existingDeviceWithDifferentApiKey) {
                console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} Serial number ${state.serialNumber} sudah terdaftar dengan api_key ${existingDeviceWithDifferentApiKey.api_key}`);
            } else {
                if (existingDevices.length < 2) {
                    const resultAddDevices = await getAddDevice(state.license, state.serialNumber);
                    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Message Status : ${resultAddDevices.message}`);
                    runBotCode();
                } else {
                    console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} Jumlah Device maksimum telah tercapai`);
                }
            }
        }
    } else {
        if (state.dataLicense.includes(state.license)) {
            console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} License Expired Hubungi Admin Untuk Perpanjang`);
        } else {
            console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} License Tidak Ditemukan`);
        }
    }
};

const mainScriptUpdate = async () => {
    console.log(textBanner());

    const resultVersionBot = await getVersionBot();

    // console.log(resultVersionBot)

    if (resultVersionBot && resultVersionBot.data) {
        const botTypeToCheck = 'Bot Fore Coffee';
        const bot = resultVersionBot.data.find(item => item.bot_type === botTypeToCheck);

        if (bot) {
            const latestVersion = bot.version;
            const currentVersion = readFile(versionPath);

            if (latestVersion !== currentVersion) {
                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} New version available: ${chalk.yellow(latestVersion)}`);
                writeFile(versionPath, latestVersion);
                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Version updated to: ${chalk.yellow(latestVersion)}`);
                // await updateScript();
            } else {
                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Type Bot : ${chalk.yellow(bot.bot_type)}`);
                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Version is up to date ${chalk.yellow(latestVersion)}`);

                await licenseFix();
            }
        } else {
            console.log('Bot type not found.');
        }
    } else {
        console.log('Failed to fetch version data.');
    }
};

const licenseFix = async () => {
    console.log(textPengumuman())

    console.log(`
=======================================
           ${chalk.green(`BOT INFORMATION`)}
=======================================`);
    readLicense();
    getDeviceId();
    const resultLicense = await getLicense();

    // console.log(resultLicense)

    state.dataLicense = resultLicense.data.map(element => element.license_key);
    await checkLicense();
};

//!API FORE NYAAA DISINII
const getVersionApk = (tokenAccess, tokenRefresh) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/get-version`, {
        method: "GET",
        headers: {
            'Host': 'api.fore.coffee',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${tokenAccess}`,
            'Refresh-Token': `${tokenRefresh}`,
            'App-Version': '4.1.23',
            'Platform': 'android',
            'Os-Version': '13',
            'Device-Id': '9906aa73-156a-4e40-8d25-505c1a14d510',
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1722043794478-9207436156631916622',
            'Country-Id': '1',
            'Timezone': '+07:00',
            'Language': 'id',
            'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
            'User-Agent': 'okhttp/4.11.0'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
});

const getToken = (versionApk, deviceId) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/get-token`, {
        method: "get",
        headers: {
            'Host': 'api.fore.coffee',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '12',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1701080912838-1213362932838682711',
            'Country-Id': '2',
            'Language': 'id',
            'User-Agent': 'okhttp/4.7.2',
            'Connection': 'close'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getCheckNomer = (accessToken, refreshToken, versionApk, deviceId, inputNumber) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/check-phone`, {
        method: "POST",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'elVbotziShKrp0yAzrZ8am:APA91bG7GpH47hOBvaIs_Ixq6KwyoRTEnZu83Rd8hzXF8mlMTzkIvUyakOazoYUrZQC3KJdfCfoCGH8h2gL8aUBp4jCCfAdwXq0dRSFxrndCiUfLaMYSsGb1TVBf_t2ibF4LpD0Ysmp5',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': '41',
            'User-Agent': 'okhttp/4.11.0'
        },
        body: JSON.stringify({
            "phone": `+62${inputNumber}`,
            "country_id": 1
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getLoginAkun = (accessToken, refreshToken, versionApk, deviceId, inputNumber, inputPin) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/login/pin`, {
        method: "POST",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': '56',
            'User-Agent': 'okhttp/4.11.0'
        },
        body: JSON.stringify({
            "phone": `+62${inputNumber}`,
            "pin": `${inputPin}`,
            "country_id": 1
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getCheckProfile = (accessToken, refreshToken, versionApk, deviceId) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/user/profile`, {
        method: "get",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'User-Agent': 'okhttp/4.11.0'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getCheckVoucher = (accessToken, refreshToken, versionApk, deviceId) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/user/voucher?page=1&perpage=20&disc_type=cat_promo&vc_disc_type=order`, {
        method: "get",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'User-Agent': 'okhttp/4.11.0'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getSendOtp = (accessToken, refreshToken, versionApk, deviceId, inputNumber) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/req-login-code`, {
        method: "POST",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': '41',
            'User-Agent': 'okhttp/4.11.0'
        }, body: JSON.stringify({
            "phone": `+62${inputNumber}`,
            "country_id": 1
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getSendOtpWa = (accessToken, refreshToken, versionApk, deviceId, inputNumber) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/req-login-code`, {
        method: "POST",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': '55',
            'User-Agent': 'okhttp/4.11.0'
        }, body: JSON.stringify({
            "phone": `+62${inputNumber}`,
            "method": "wa",
            "country_id": 1
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getSignUp = (accessToken, refreshToken, versionApk, deviceId, inputNumber, inputCodeOtp, inputCodeReff) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/sign-up`, {
        method: "POST",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': '117',
            'User-Agent': 'okhttp/4.11.0'
        }, body: JSON.stringify({
            "phone": `+62${inputNumber}`,
            "code": `${inputCodeOtp}`,
            "name": "MUHAMAD IQBAL",
            "referral_code": `${inputCodeReff}`,
            "whatsapp": 1,
            "country_id": 1
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getSetPin = (accessToken, refreshToken, versionApk, deviceId, pinAkun) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/auth/pin`, {
        method: "POST",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': '39',
            'User-Agent': 'okhttp/4.11.0'
        }, body: JSON.stringify({
            "pin": `${pinAkun}`,
            "confirm_pin": `${pinAkun}`
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getUpdateProfile = (accessToken, refreshToken, versionApk, deviceId, nameAkun, email, birthDay) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/user/profile`, {
        method: "PUT",
        headers: {
            'Host': 'api.fore.coffee',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '9',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1714793545227-458474193098194639',
            'Country-Id': '1',
            'Timezone': '+08:00',
            'Language': 'id',
            'Push-Token': 'fw-gFHn-TuiA4BPH5xTvOY:APA91bFWYOQ0XFi02-pnmdsKIJ2YuEHoiwRxvGXHlrzEut-2v4WnZ25IXrjBxJL3ByzV4Rcu3kCOShf3zrjYFn7PO6AVrXY65mqo-c1co3p4hxCbgrL6nMfufX0IBq0_MssPFNymIgyw',
            'Appsflyer-Advertising-Id': '2a835d31-b231-49ea-a21e-1f6f92fb0001',
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': '115',
            'User-Agent': 'okhttp/4.11.0'
        }, body: JSON.stringify({
            "user_name": `${nameAkun}`, //!GANTI NAMA KAMU DISINI
            "user_email": `${email}`,
            "user_birthday": `${birthDay}`,
            "user_gender": "male"
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
})

const getInfoAkun = (accessToken, refreshToken, versionApk, deviceId) => new Promise((resolve, reject) => {
    fetch(`https://api.fore.coffee/user/profile/detail`, {
        method: "GET",
        headers: {
            'Host': 'api.fore.coffee',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Access-Token': `${accessToken}`,
            'Refresh-Token': `${refreshToken}`,
            'App-Version': `${versionApk}`,
            'Platform': 'android',
            'Os-Version': '13',
            'Device-Id': `${deviceId}`,
            'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
            'Appsflyer-Id': '1722043794478-9207436156631916622',
            'Country-Id': '1',
            'Timezone': '+07:00',
            'Language': 'id',
            'Push-Token': 'fQIMKfv4SFaJUt8c-2oAka:APA91bGkmHeTP1C3QmGMMaCzl3hYTRq8VHJYZCLN9LF00yYCambdcRLrH4HM9Oez7J1tV68YTunNYkWSYSDrmBSu31fbx4dBuLec8MYQIgyOOwAuENymMLY7aL0cQycCN9z9QXjQBM1u',
            'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
            'User-Agent': 'okhttp/4.11.0'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(error => reject(error))
});

//!API SMSHUB
const getBalance = (apiKey) => new Promise((resolve, reject) => {
    fetch(`https://smshub.org/stubs/handler_api.php?api_key=${apiKey}&action=getBalance&currency=840`, {
        method: 'get'
    })
        .then(res => res.text())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const getPrice = (apiKey) => new Promise((resolve, reject) => {
    fetch(`https://smshub.org/stubs/handler_api.php?api_key=${apiKey}&action=getPrices&service=asy&country=6&currency=840`, {
        method: `POST`
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const getNumber = (apiKey, selectedPrice) => new Promise((resolve, reject) => {
    fetch(`https://smshub.org/stubs/handler_api.php?api_key=${apiKey}&action=getNumber&service=asy&operator=any&country=6&maxPrice=${selectedPrice}&currency=840`, {
        method: `POST`
    })
        .then(res => res.text())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const setStatus = (apiKey, ID) => new Promise((resolve, reject) => {
    fetch(`https://smshub.org/stubs/handler_api.php?api_key=${apiKey}&action=setStatus&status=8&id=${ID}`, {
        method: `get`
    })
        .then(res => res.text())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const getStatus = (apiKey, ID) => new Promise((resolve, reject) => {
    fetch(`https://smshub.org/stubs/handler_api.php?api_key=${apiKey}&action=getStatus&id=${ID}`, {
        method: `get`
    })
        .then(res => res.text())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

//!API CHECKOU FORE NYA DISINI
const checkPaymentBlu = async (accessToken, refreshToken, versionApk, deviceId) => {
    try {
        const getData = await fetch(`https://api.fore.coffee/blu/get_blu_phone`, {
            method: 'GET',
            headers: {
                'Host': 'api.fore.coffee',
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'User-Agent': 'okhttp/4.11.0'
            }
        })

        const resultData = getData.json();
        return resultData;
    } catch (error) {
        console.log(error)
    }
}

const getAddPaymentBlue = async (accessToken, refreshToken, versionApk, deviceId, inputNomerBlue) => {
    try {
        const getData = await fetch(`https://api.fore.coffee/blu/save_blu_phone`, {
            method: 'POST',
            headers: {
                'Host': 'api.fore.coffee',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': '37',
                'User-Agent': 'okhttp/4.11.0'
            },
            body: JSON.stringify({
                "blu_phone_number": `+62${inputNomerBlue}`
            })
        })

        const resultData = getData.json();
        return resultData;
    } catch (error) {
        console.log(error)
    }
}

const getOutlet = async (inputLokasi, accessToken, refreshToken, versionApk, deviceId) => {
    try {
        const getData = await fetch(`https://api.fore.coffee/store/all?keyword=${inputLokasi}`, {
            method: 'GET',
            headers: {
                'Host': 'api.fore.coffee',
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'User-Agent': 'okhttp/4.11.0'
            }
        })

        const resultData = getData.json();
        return resultData;
    } catch (error) {
        console.log(error)
    }
}

const getProductCoffee = async (idOutlet, accessToken, refreshToken, versionApk, deviceId) => {
    try {
        const getData = await fetch(`https://api.fore.coffee/product/v2?store=${idOutlet}`, {
            method: "GET",
            headers: {
                'Host': 'api.fore.coffee',
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'User-Agent': 'okhttp/4.11.0'
            }
        })

        const resultData = getData.json();
        return resultData
    } catch (error) {
        console.log(error)
    }
}

const getDetailCoffee = async (idCoffee, idOutlet, accessToken, refreshToken, versionApk, deviceId) => {
    try {
        const getData = await fetch(`https://api.fore.coffee/product/v2/${idCoffee}?store=${idOutlet}`, {
            method: "GET",
            headers: {
                'Host': 'api.fore.coffee',
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'User-Agent': 'okhttp/4.11.0'
            }
        })

        const resultData = getData.json();
        return resultData
    } catch (error) {
        console.log(error)
    }
}

const getCheckoutDetail = async (accessToken, refreshToken, versionApk, deviceId, idOutlet, inputVoucher, pdId, formattedAdditions) => {

    try {
        const getData = await fetch(`https://api.fore.coffee/checkout/update-and-summary`, {
            method: 'POST',
            headers: {
                'Host': 'api.fore.coffee',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': '663',
                'User-Agent': 'okhttp/4.11.0'
            },
            body: JSON.stringify({
                "cart_data": {
                    "delivery": "dine_in",
                    "st_id": idOutlet,
                    "uadd_temporary": {
                        "uadd_title": "",
                        "uadd_person": "",
                        "uadd_phone": "",
                        "uadd_street": "",
                        "uadd_notes": "",
                        "uadd_lat": "0.0",
                        "uadd_long": "0.0"
                    },
                    "uadd_id": 0,
                    "vc_codes": [
                        inputVoucher
                    ],
                    "pymtd_id": 45,
                    "straw": 0,
                    "tissue": 0,
                    "reusable_bag": 0,
                    "paper_bag": 0,
                    "delivery_internal": 0,
                    "notes": "",
                    "point": 0,
                    "point_donate": 0,
                    "auto_apply_vc": 0,
                    "auto_apply_delivery_vc": 0,
                    "delivery_vc_codes": []
                },
                "products": [
                    {
                        "pd_id": pdId,
                        "cartpd_qty": 1,
                        "preset_id": 0,
                        "is_carousel": 0,
                        "pd_additionals": formattedAdditions // Masukkan formattedAdditions di sini
                    }
                ],
                "is_address_optional": 1
            })
        });

        const resultData = getData.json()
        return resultData
    } catch (error) {
        console.log(error)
    }
}

const getCheckout = async (accessToken, refreshToken, versionApk, deviceId) => {
    try {
        const getData = await fetch(`https://api.fore.coffee/checkout/cart/pay`, {
            method: "POST",
            headers: {
                'Host': 'api.fore.coffee',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': '2',
                'User-Agent': 'okhttp/4.11.0'
            },
            body: JSON.stringify({

            })
        })

        const resultData = getData.json();
        return resultData
    } catch (error) {
        console.log(error)
    }
}

const getCheckStatusOrder = async (idInvoice, accessToken, refreshToken, versionApk, deviceId) => {
    try {
        const getData = await fetch(`https://api.fore.coffee/order/${idInvoice}`, {
            method: "GET",
            headers: {
                'Host': 'api.fore.coffee',
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Access-Token': `${accessToken}`,
                'Refresh-Token': `${refreshToken}`,
                'App-Version': `${versionApk}`,
                'Platform': 'android',
                'Os-Version': '13',
                'Device-Id': `${deviceId}`,
                'Secret-Key': '0kFe6Oc3R1eEa2CpO2FeFdzElp',
                'Appsflyer-Id': '1722043794478-9207436156631916622',
                'Country-Id': '1',
                'Timezone': '+07:00',
                'Language': 'id',
                'Appsflyer-Advertising-Id': '33ca2a31-b7bf-4556-880d-08c5f62b916a',
                'User-Agent': 'okhttp/4.11.0'
            },
        })

        const resultData = getData.json();
        return resultData
    } catch (error) {
        console.log(error)
    }
}

//!TEXT NYA DISINI
const textFeature = () => {
    const textValue = `${chalk.yellow(`[`)}-${chalk.yellow(`]`)} PILIH FEATURES DIBAWAH :
  ${chalk.green(`[`)}1${chalk.green(`]`)} CREATE ACCOUNT MANUAL
  ${chalk.green(`[`)}2${chalk.green(`]`)} AUTO CREATE ACCOUNT WITH (${chalk.green(`SMSHUB`)})
  ${chalk.green(`[`)}3${chalk.green(`]`)} CHECKOUT MENU FORE
  ${chalk.green(`[`)}4${chalk.green(`]`)} INPUT BIRTHDAY MANUAL
  ${chalk.green(`[`)}5${chalk.green(`]`)} AUTO CHECK VOUCHER BIRTHDAY
  `
    return textValue;
}

const textGetToken = (accessToken, refreshToken) => {
    const textValue = `${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Success Mendapatkan Token`)}
    Access Token  : ${chalk.yellow(accessToken)}
    Refresh Token : ${chalk.yellow(refreshToken)}
      `
    return textValue;
}

const textChooseOTP = () => {
    const textValue = `${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`PILIH SEND OTP KEMANA`)}
   [1] SEND OTP KE SMS
   [2] SEND OTP KE WHATSAPP
      `
    return textValue
}

const checkAccountFillEmail = (akunSuccessFillEmail, akunGagalFillEmail) => {
    const valueText = `[!] ${chalk.yellow(`HASIL CREATE ACCOUNT FORE COFFEE`)}
    - Akun Berhasil Set Email Dan Birthday : ${chalk.green(akunSuccessFillEmail)}
    - Akun Gagal Set Email Dan Birthday : ${chalk.red(akunGagalFillEmail)}
    `
    return valueText
}

const successGetNumber = (ID, number) => {
    const valueText = `[!] ${chalk.green(`Success Get Order Number`)}
    - ID     : ${chalk.yellow(ID)}
    - Number : ${chalk.yellow(number)}
    `
    return valueText
}

const textProfile = (name, number, kodeReff, birthDay, emailAkun, dateCreateAkun) => {
    const value = `[!] ${chalk.green(`INFO PROFILE AKUN FORE COFFEE`)}
  - Nama Akun      : ${chalk.yellow(name)}
  - Nomer HP       : ${chalk.yellow(number)}
  - Kode Refferal  : ${chalk.yellow(kodeReff)}
  - Tanggal Lahir  : ${chalk.yellow(birthDay)}
  - Email          : ${chalk.yellow(emailAkun)}
  - Tanggal Dibuat : ${chalk.yellow(dateCreateAkun)}
    `

    return value
}

const textRequestData = (nameUse, emailUse, birthdayUse) => {
    const valueText = `[!] DATA YANG DIGUNAKAN
  - Nama     : ${chalk.yellow(nameUse)}
  - Email    : ${chalk.yellow(emailUse)}
  - Birthday : ${chalk.yellow(birthdayUse)}
    `
    return valueText
}

const textFoundVoc = (namaVoucher, startVoucher, endVoucher) => {
    const value = `
=======================================
           ${chalk.green(`VOUCHER BIRTHDAY`)}
=======================================
- Nama Voucher  : ${chalk.yellow(namaVoucher)}
- Start Voucher : ${chalk.yellow(startVoucher)}
- End Voucher   : ${chalk.yellow(endVoucher)}
    `
    return value
}




//!FUNCTION PELENGKAP
const device = () => {
    const generateHex = (length) => {
        return [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    };

    const part1 = generateHex(8);
    const part2 = generateHex(4);
    const part3 = generateHex(4);
    const part4 = generateHex(4);
    const part5 = generateHex(12);

    return `${part1}-${part2}-${part3}-${part4}-${part5}`;
};

function pad(number) {
    try {

        return (number < 10 ? '0' : '') + number;
    } catch (error) {
        console.log(error)
    }
}

const randstr = length =>
    new Promise((resolve, reject) => {
        var text = "";
        var possible =
            "1234567890";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        resolve(text);
    });

function listHarga(priceService) {

    try {

        const test = priceService;
        let count = 1;
        console.log(`[${chalk.green(`!`)}] Daftar Harga Dan Stock Number Fore Coffe`)
        for (let key in test) {
            console.log(`   [${chalk.green(count)}] Harga : ${chalk.green(key)} (${chalk.yellow(test[key])})`)
            // console.log(textListHarga(key, priceService))
            count++
        }
    } catch (error) {
        console.log(error)
    }
}

async function savedAccount(fileName, number, pin) {
    // Trim spasi putih dari number dan pin
    const trimmedNumber = number.trim();
    const trimmedPin = pin.trim();

    // Format data dengan newline
    const savedFormat = `${trimmedNumber}|${trimmedPin}${os.EOL}`;

    try {
        await fs1.appendFile(fileName, savedFormat, 'utf8');
        console.log(`[!] ${chalk.green(`Success Saved Akun To ${fileName}`)}`);
    } catch (error) {
        console.log(`[!] ${chalk.red(`Gagal Menyimpan Akun To ${fileName}`)}`);
        console.log();
    }
}

function addMonthsAndDays(date, months, days) {
    let newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);

    // Adjust if the month changes unexpectedly due to invalid day (e.g., 31st February)
    if (newDate.getMonth() !== (date.getMonth() + months) % 12) {
        newDate.setDate(0); // Set to the last day of the previous month
    }

    newDate.setDate(newDate.getDate() + days);

    // Set the year to 2000
    newDate.setFullYear(2000);

    return newDate;
}

function resultListOutlet(resultOutlet) {
    if (resultOutlet.status !== 'success' || !Array.isArray(resultOutlet.payload)) {
        throw new Error('Invalid resultOutlet format');
    }

    return resultOutlet.payload.map(outlet => {
        return {
            'ID Outlet': outlet.st_id,
            'Nama Outlet': outlet.st_code,
            'Tempat Outlet': outlet.st_name,
            'Jam buka': outlet.st_open,
            'Jam tutup': outlet.st_close,
            'Status Outlet Sekarang': outlet.is_open ? 'Outlet Buka' : 'Outlet Tutup'
        };
    });
}

function formatOutletList(dataListOutlet, inputLokasi) {
    if (!Array.isArray(dataListOutlet) || dataListOutlet.length === 0) {
        console.log('No dataListOutlet found.');
        return;
    }

    console.log(`${chalk.yellow(`[!`)}${chalk.yellow(`]`)} ${chalk.yellow(`LIST OUTLET FROM SEARCH ${inputLokasi.toUpperCase()}\n`)}`);

    dataListOutlet.forEach((outlet, index) => {
        console.log(`${chalk.yellow(`[${index + 1}]`)} ${chalk.yellow(`List Outlet Ke - ${index + 1}`)}`);
        console.log(`   - ID Outlet       : ${outlet['ID Outlet']}`);
        console.log(`   - Nama Outlet     : ${outlet['Nama Outlet']}`);
        console.log(`   - Tempat Outlet   : ${outlet['Tempat Outlet']}`);
        console.log(`   - Jam buka        : ${outlet['Jam buka']}`);
        console.log(`   - Jam tutup       : ${outlet['Jam tutup']}`);
        console.log(`   - Buka Atau Tutup : ${outlet['Status Outlet Sekarang']}\n`);
    });
}

function resultListCoffee(resulProductCoffee) {
    if (resulProductCoffee.status !== 'success' || !Array.isArray(resulProductCoffee.payload)) {
        throw new Error('Invalid resulProductCoffee format');
    }

    return resulProductCoffee.payload.map(product => {
        return {
            'ID product': product.pd_id,
            'Nama product': product.pd_code,
            'Category product': product.cat_name,
            'Harga Coffee': product.pd_final_price,
            // 'Jam tutup': product.st_close,
            'Status product Sekarang': product.stpd_status === 'active' ? 'Stock Tersedia' : 'Stock Habis'
        };
    });
}

function printCoffeeCategory(dataList) {
    // Ambil kategori produk dari data pertama (asumsi semua item dalam kategori yang sama)
    const category = dataList.length > 0 ? dataList[0]['Category product'] : 'Unknown Category';

    // console.log(`CATEGORY COFFE ${category}`);

    // Loop melalui dataList untuk menampilkan informasi setiap produk
    dataList.forEach((coffee, index) => {
        console.log(`${chalk.green(`[`)}${index + 1}${chalk.green(`]`)} Id Product : ${chalk.yellow(coffee['ID product'])}`);
        console.log(`   - Category Product : ${chalk.yellow(coffee['Category product'])}`);
        console.log(`   - Nama Coffee      : ${chalk.yellow(coffee['Nama product'])}`);
        console.log(`   - Harga Coffee     : ${chalk.yellow(coffee['Harga Coffee'])}`);
        console.log(`   - Status Tersedia  : ${chalk.yellow(coffee['Status product Sekarang'])}`);
        console.log(); // Tambahkan baris kosong untuk pemisah antara produk
    });
}

const getAllAdditions = (product) => {
    const additions = product.pd_additionals.map(additional => ({
        category: additional.cat_name,
        paId: additional.pa_id,
        name: additional.name_additional,
        price: additional.pd_final_price,

    }));
    return additions;
};

function resultConfirmOrder(resultDetailCheckout) {
    // Memeriksa apakah resultDetailCheckout dan payload ada
    if (resultDetailCheckout && resultDetailCheckout.payload) {
        const { payload } = resultDetailCheckout;
        const { uor_subtotal, uor_discount, uor_total } = payload;

        return {
            uor_subtotal,
            uor_discount,
            uor_total
        };
    } else {
        // Menangani kasus jika resultDetailCheckout tidak memiliki payload
        console.error('Invalid resultDetailCheckout object');
        return null;
    }
}

function resultConfirmOrder2(detailConfirmProduct) {
    // Memeriksa apakah detailConfirmProduct dan pd_additionals ada
    if (detailConfirmProduct && detailConfirmProduct.pd_additionals) {
        const { pd_name, cat_name, pd_additionals } = detailConfirmProduct;

        // Mengambil name_additional dari pd_additionals
        const additionalNames = pd_additionals.map(additional => additional.name_additional);

        return {
            pd_name,
            cat_name,
            additionalNames
        };
    } else {
        // Menangani kasus jika detailConfirmProduct tidak memiliki pd_additionals
        console.error('Invalid detailConfirmProduct object');
        return null;
    }
}

function showProducts(category, dataDetailProduct) {
    const filteredProducts = dataDetailProduct.filter(item => item.category === category);

    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Daftar produk untuk kategori ${category} : `)}`);

    console.log();

    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.yellow(`Noted`)} : Pilih harga 0, jika tidak ada maka pilih kembali`)

    console.log()

    filteredProducts.forEach((product, index) => {
        console.log(`${chalk.green(`[`)}${index + 1}${chalk.green(`]`)} ${chalk.yellow(`Product ID: ${product.paId}`)} - Additional: ${product.name} - ${chalk.green(`Harga: ${product.price}`)}`);
    });

    console.log(`[${chalk.red(`0`)}] ${chalk.red(`KEMBALI`)}`);

    console.log();

    return filteredProducts;
}

function chooseCoffee(dataDetailProduct, detectInput) {
    let hasilInputCoffee = [];
    let availableCategories = [...detectInput]; // Menyalin daftar kategori yang tersedia

    while (true) {
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`PILIH CATEGORY DIBAWAH`)}`);

        availableCategories.forEach((category, index) => {
            console.log(`  ${chalk.green(`[`)}${index + 1}${chalk.green(`]`)} ${category}`);
        });
        console.log(`${chalk.red(`  [`)}0${chalk.red(`]`)} ${chalk.red(`CANCEL`)}`);

        console.log();

        const categoryChoice = readlineSync.question(`[${chalk.yellow(`?`)}] Pilih kategori [1...N / 0]: `);

        console.log();

        const categoryIndex = parseInt(categoryChoice, 10) - 1;

        if (categoryChoice === '0') {
            console.log(`[!] ${chalk.red(`Pilih kategori dibatalkan.`)}`);
            break;
        }

        if (categoryIndex >= 0 && categoryIndex < availableCategories.length) {
            const selectedCategory = availableCategories[categoryIndex];
            availableCategories.splice(categoryIndex, 1); // Menghapus kategori yang sudah dipilih

            const products = showProducts(selectedCategory, dataDetailProduct);

            while (true) {
                const productChoice = readlineSync.question(`[${chalk.yellow(`?`)}] Pilih produk [1...N / 0]: `);

                console.log();

                const productIndex = parseInt(productChoice, 10) - 1;

                if (productChoice === '0') {
                    console.log(`[!] ${chalk.red(`Pemilihan produk dibatalkan.`)}`);
                    break;
                }

                if (productIndex >= 0 && productIndex < products.length) {
                    const selectedProduct = products[productIndex];
                    hasilInputCoffee.push(selectedProduct.paId);

                    console.log(`[!] ${chalk.green(`Kamu memilih ${selectedProduct.name} dengan harga ${selectedProduct.price}(${selectedProduct.paId})`)}`);

                    console.log();

                    break;
                } else {
                    console.log(`[!] ${chalk.red(`Pilihan tidak valid. Silakan coba lagi.`)}`);
                }
            }
        } else {
            console.log(`[!] ${chalk.red(`Kategori tidak valid. Silakan coba lagi.`)}`);
            console.log();
        }

        if (availableCategories.length === 0) {
            console.log(`[!] ${chalk.red(`Semua kategori telah dipilih.`)}`);

            console.log();

            break;
        }
    }

    return hasilInputCoffee
}

function formatProductAdditions(hasilInputCoffee) {
    return hasilInputCoffee.map(paId => ({
        pa_id: paId,
        free_qty: 0,
        pa_qty: 1
    }));
}

function formatProductDetails(detailProduct, detailProduct2) {
    // Mengambil nilai dari detailProduct
    const { uor_subtotal, uor_discount, uor_total } = detailProduct;

    // Mengambil nilai dari detailProduct2
    const { pd_name, cat_name, additionalNames } = detailProduct2;

    // Membuat format teks
    const formattedText = `
${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`DETAIL PRODUCT COFFEE`)}
  - Nama Coffee            : ${chalk.yellow(pd_name)}
  - Category Coffee        : ${chalk.yellow(cat_name)}
  - Tambahan Yang di pilih : ${chalk.yellow(additionalNames.join(', '))}
  
  - Harga Coffee           : ${chalk.yellow(uor_subtotal)}
  - Discount               : ${chalk.yellow(uor_discount)}
  - Total Payment          : ${chalk.yellow(uor_total)}
  `;

    console.log(formattedText);
}

function getOrderDetails(resultStatusOrder) {
    const {
        payload: {
            uor_date,
            st_name,
            user_name,
            user_email,
            payment: { pymtd_name },
            uor_status_label,
            uor_total,
            user_phone,
            uor_queue,
            uor_code
        }
    } = resultStatusOrder;

    const orderDetails = `
${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`SUCCESS ORDER DENGAN DETAIL`)}

- Order Date     : ${chalk.yellow(uor_date)}
   - Order Location : ${chalk.yellow(st_name)}
   - Payment Use    : ${chalk.yellow(pymtd_name)}
   - Nama Customer  : ${chalk.yellow(user_name)}
   - Email Customer : ${chalk.yellow(user_email)}
   - Nomer HP       : ${chalk.yellow(user_phone)}
   - Total Payment  : ${chalk.yellow(uor_total)}
   
   - Order ID       : ${chalk.yellow(uor_code)}
   - Nomer Antrian  : ${chalk.yellow(uor_queue)}
   - Status Orderan : ${chalk.yellow(uor_status_label)}
   `;

    return orderDetails.trim();
}

const dateNow = () => {
    const today = new Date();

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // Bulan berbasis 1 (Januari = 1)
    const currentDate = today.getDate();

    console.log(`[${chalk.green(`!`)}] Date Now : ${currentYear}-${currentMonth}-${currentDate}`)
}

function getRandomNumber() {
    return Math.floor(Math.random() * 200) + 1;
}


// Fungsi untuk membaca file dan mencari PIN berdasarkan nomor
const getNumberAndPin = () => {
    try {
        const pathToFile = './setBirthday.txt';

        const fileContent = fs.readFileSync(pathToFile, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== ''); // Menghapus baris kosong

        // Menyimpan nomor dan PIN dalam array
        const numberPinPairs = lines.map(line => {
            const [number, pin] = line.split('|');
            return { number, pin };
        });

        return numberPinPairs;
    } catch (error) {
        console.error(`[!] Error reading file: ${error}`);
        process.exit(1);
    }
};

const getNumberAndPin2 = () => {
    try {
        const pathToFile = `./foreAkun.txt`

        const fileContent = fs.readFileSync(pathToFile, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== ''); // Menghapus baris kosong

        // Menyimpan nomor dan PIN dalam array
        const numberPinPairs = lines.map(line => {
            const [number, pin] = line.split('|');
            return { number, pin };
        });

        return numberPinPairs;
    } catch (error) {
        console.error(`[!] Error reading file: ${error}`);
        process.exit(1);
    }
};

//!FEATURES ADA DISINI
const features1 = async (jumlahCreateAccount, versionApk, inputCodeReff) => {
    try {

        console.log()
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Kamu Memilih Feature ${chalk.yellow(`4`)}`)
        console.log();

        for (let i = 1; i <= jumlahCreateAccount; i++) {
            console.log();

            console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`CREATE ACCOUNT FORE COFFE KE - ${i}`)}`)

            const deviceId = device();

            const tokenCheck = await getToken(versionApk, deviceId)

            // console.log(tokenCheck)
            //Input Number Manual
            //Input Number Auto
            if (tokenCheck.statusCode === 200) {
                const accessToken = tokenCheck.payload.access_token;
                const refreshToken = tokenCheck.payload.refresh_token;

                console.log(textGetToken(accessToken, refreshToken));

                const inputNumber = readlineSync.question(`[${chalk.yellow(`?`)}] Masukkan Number (${chalk.yellow(`cth : 821`)}): `)
                const checkNomer = await getCheckNomer(accessToken, refreshToken, versionApk, deviceId, inputNumber)
                // console.log(checkNomer)
                //! CHECK AKUN
                if (checkNomer.payload.is_registered === 1) {
                    console.log(`[${chalk.green(`!`)}] ${chalk.green(`Akun Sudah Terdaftar. Lanjut Login..`)}`)

                    const inputPin = readlineSync.question(`[?] Masukkan PIN Akun : `);

                    const loginAkun = await getLoginAkun(accessToken, refreshToken, versionApk, deviceId, inputNumber, inputPin)
                    // console.log(loginAkun)
                    //! LOGIN AKUN WITH PIN
                    if (loginAkun.statusCode === 200) {
                        console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Login Akun..`)}`)


                        const profileCheck = await getCheckProfile(accessToken, refreshToken, versionApk, deviceId)
                        // console.log(profileCheck)
                        //!CHECK PROFILE
                        if (profileCheck.statusCode === 200) {
                            console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Waitting Get Profile Akun..`)}`)
                            await delay(2 * 1000);
                            console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Get Profile Akun`)}`)

                            const checkBirthDay = profileCheck.payload.user_birthday
                            // console.log(profileCheck)
                            // console.log(checkBirthDay)
                            //!CHECK BIRTHDAY KOSONG ATAU TIDAK
                            if (checkBirthDay === null) {
                                console.log(`[${chalk.red(`!`)}] ${chalk.red(`Profile BirthDay Pada Akun Belum Diisi!`)}`)

                                const domain = `gmail.com`;
                                const firstName = faker.name.lastName();
                                const lastName = faker.name.lastName();
                                const fullName = `${firstName}${lastName}${await randstr(2)}`
                                const email = `${fullName}@${domain}`.toLowerCase();
                                // console.log(domain)
                                // console.log(fullName)
                                console.log(`[!] Email Use : ${chalk.green(email)}`)

                                console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Get Check Date Today..`)}`)
                                await delay(3 * 1000)
                                const date = new Date();
                                const fullDate = date.toISOString().split(`T`)[0];
                                console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`Date Today : ${fullDate}`)}`);
                                console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Set BirthDay +3 Bulan...`)}`);

                                await delay(3 * 1000)
                                // Tambah 3 bulan dan 1 hari
                                let newDate = addMonthsAndDays(date, 3, 1);

                                const birthDay = newDate.toISOString().split(`T`)[0];

                                console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`Set Birtday Menjadi : ${birthDay}`)}`);

                                const updateProfile = await getUpdateProfile(accessToken, refreshToken, versionApk, deviceId, firstName, email, birthDay)

                                // console.log(updateProfile.payload.errors)
                                // console.log(updateProfile)
                                if (updateProfile.statusCode === 200) {
                                    console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Set BirthDay Profile!`)}`)

                                    const table = new Table();

                                    table.push(
                                        { 'User ID': updateProfile.payload.user_id },
                                        { 'Username': updateProfile.payload.user_name },
                                        { 'Birthday': updateProfile.payload.user_birthday },
                                        { 'Code Referral': updateProfile.payload.user_code },
                                        { 'Email': updateProfile.payload.user_email },
                                        { 'Tanggal Akun dibuat': updateProfile.payload.created_date },
                                    )

                                    console.log();
                                    console.log(chalk.bold('USER DATA PROFILE'));
                                    console.log(table.toString());
                                } else {
                                    console.log(updateProfile.payload.errors)
                                }

                                return;
                            }

                            const table = new Table();

                            table.push(
                                { 'User ID': profileCheck.payload.user_id },
                                { 'Username': profileCheck.payload.user_name },
                                { 'Birthday': profileCheck.payload.user_birthday },
                                { 'Code Referral': profileCheck.payload.user_code },
                                { 'Email': profileCheck.payload.user_email },
                                { 'Tanggal Akun dibuat': profileCheck.payload.created_date },
                            )

                            console.log();
                            console.log(chalk.bold('USER DATA PROFILE'));
                            console.log(table.toString());

                            const checkVoucher = await getCheckVoucher(accessToken, refreshToken, versionApk, deviceId)

                            // console.log(checkVoucher)

                            //!GET CHECK VOUCHER
                            if (checkVoucher.statusCode === 200) {
                                const tableVoucher = new Table();

                                checkVoucher.payload.data.forEach((voucher, index) => {
                                    tableVoucher.push(
                                        { 'URUTAN VOUCHER': index + 1 },
                                        { 'Voucher Code': voucher.vc_code },
                                        { 'Nama Voucher': voucher.prm_name },
                                        { 'Type Voucher': voucher.prm_campaign_type },
                                        { 'Deskripsi Voucher': voucher.prm_short_description },
                                        { 'Start Voucher': voucher.prm_start },
                                        { 'End Voucher': voucher.prm_end },
                                    )
                                });

                                console.log();
                                console.log(chalk.bold('VOUCHER AKUN FORE COFFE'));
                                console.log(tableVoucher.toString());

                            } else {
                                console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Check Voucher Akun. Detail Error dibawah`)}`)
                                console.log(checkVoucher)
                            }

                        } else {
                            console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Check Profile Akun. Detail Error dibawah`)}`)
                            console.log(profileCheck)
                        }

                    } else if (loginAkun.statusCode === 500) {
                        console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Login Akun. PIN Salah..`)}`)
                        console.log(loginAkun.payload.errors)
                    } else {
                        console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Login Akun. Ada Kesalahan!`)}`)
                    }

                } else if (checkNomer.payload.is_registered === 0) {
                    console.log(`[${chalk.red(`!`)}] ${chalk.red(`Akun Belum Terdaftar. Lanjut Mendaftar..`)}`)
                    console.log()
                    console.log(textChooseOTP())
                    const inputChooseOtp = readlineSync.questionInt(`[?] Masukkan Pilihan Kamu : `)
                    //! PILIHAN SEND OTP
                    if (inputChooseOtp === 1) {
                        //! GET SEND OTP TO SMS
                        const sendOtp = await getSendOtp(accessToken, refreshToken, versionApk, deviceId, inputNumber)
                        // console.log(sendOtp)
                        // console.log(sendOtp.payload.errors)

                        if (sendOtp.statusCode === 200) {
                            const statusMessages = sendOtp.payload.id;
                            console.log(`[${chalk.green(`!`)}] ${chalk.green(statusMessages)}`)

                            const inputCodeOtp = readlineSync.question(`[?] Masukkan Kode OTP Disini : `);

                            const signUp = await getSignUp(accessToken, refreshToken, versionApk, deviceId, inputNumber, inputCodeOtp, inputCodeReff)

                            // console.log(signUp)

                            //! SIGN UP CHECK
                            if (signUp.statusCode === 200) {
                                console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Registrasi Akun`)}`)

                                //!PIN AKUN GANTI DISINI

                                const pinAkun = process.env.CREATE_PIN;

                                const setPin = await getSetPin(accessToken, refreshToken, versionApk, deviceId, pinAkun)
                                // console.log(setPin)

                                //!SAVE AKUN

                                const fileName = `foreAkun.txt`
                                // const newLine = os.EOL;
                                // const data = `${inputNumber}|${pinAkun}${newLine}`

                                await savedAccount(fileName, inputNumber, pinAkun)

                                //!SET PIN
                                if (setPin.statusCode === 200) {
                                    console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Set PIN`)}`)
                                    console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Fill Data Profile Akun...`)}`)

                                    const domain = `gmail.com`;
                                    const firstName = faker.name.lastName();
                                    const lastName = faker.name.lastName();
                                    const nameAkun = process.env.AKUN_NAME;
                                    const fullName = `${firstName}${lastName}${await randstr(2)}`
                                    const email = `${fullName}@${domain}`.toLowerCase();
                                    // console.log(domain)
                                    // console.log(fullName)
                                    console.log(`[!] Email Use : ${chalk.green(email)}`)

                                    console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Get Check Date Today..`)}`)
                                    await delay(3 * 1000)

                                    const date = new Date();
                                    const fullDate = date.toISOString().split(`T`)[0];
                                    console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`Date Today : ${fullDate}`)}`);
                                    console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Set BirthDay +3 Bulan...`)}`);

                                    await delay(3 * 1000)
                                    // Tambah 3 bulan dan 1 hari
                                    let newDate = addMonthsAndDays(date, 3, 1);

                                    const birthDay = newDate.toISOString().split(`T`)[0];

                                    console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`New BirthDay : ${birthDay}`)}`);

                                    const updateProfile = await getUpdateProfile(accessToken, refreshToken, versionApk, deviceId, nameAkun, email, birthDay)

                                    // console.log(updateProfile.payload.errors)
                                    // console.log(updateProfile)
                                    if (updateProfile.statusCode === 200) {
                                        console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Set BirthDay Profile!`)}`)

                                        const table = new Table();

                                        table.push(
                                            { 'User ID': updateProfile.payload.user_id },
                                            { 'Username': updateProfile.payload.user_name },
                                            { 'Birthday': updateProfile.payload.user_birthday },
                                            { 'Code Referral': updateProfile.payload.user_code },
                                            { 'Email': updateProfile.payload.user_email },
                                            { 'Tanggal Akun dibuat': updateProfile.payload.created_date },
                                        )

                                        console.log();
                                        console.log(chalk.bold('USER DATA PROFILE'));
                                        console.log(table.toString());

                                        const checkVoucher = await getCheckVoucher(accessToken, refreshToken, versionApk, deviceId)

                                        // console.log(checkVoucher)

                                        //!GET CHECK VOUCHER
                                        if (checkVoucher.statusCode === 200) {
                                            const tableVoucher = new Table();

                                            checkVoucher.payload.data.forEach((voucher, index) => {
                                                tableVoucher.push(
                                                    { 'URUTAN VOUCHER': index + 1 },
                                                    { 'Voucher Code': voucher.vc_code },
                                                    { 'Nama Voucher': voucher.prm_name },
                                                    { 'Type Voucher': voucher.prm_campaign_type },
                                                    { 'Deskripsi Voucher': voucher.prm_short_description },
                                                    { 'Start Voucher': voucher.prm_start },
                                                    { 'End Voucher': voucher.prm_end },
                                                )
                                            });

                                            console.log();
                                            console.log(chalk.bold('VOUCHER AKUN FORE COFFE'));
                                            console.log(tableVoucher.toString());

                                        } else {
                                            console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Check Voucher Akun. Detail Error dibawah`)}`)
                                            console.log(checkVoucher)
                                        }
                                    } else {
                                        console.log(updateProfile.payload.errors)
                                    }
                                } else {
                                    const messageError = setPin.payload.errors[0].id
                                    console.log(messageError)
                                }
                            } else {
                                const messageError = signUp.payload.errors[0].id
                                console.log(messageError)
                            }

                        } else {
                            const statusError = sendOtp.payload.errors[0].id
                            console.log(`[${chalk.red(`!`)}] ${chalk.red(statusError)}`)
                        }
                    } else if (inputChooseOtp === 2) {
                        //! GET SEND OTP TO WHATSAPP

                        const sendOtpWa = await getSendOtpWa(accessToken, refreshToken, versionApk, deviceId, inputNumber)
                        // console.log(sendOtpWa)
                        // console.log(sendOtpWa.payload.errors)

                        if (sendOtpWa.statusCode === 200) {
                            const statusMessages = sendOtpWa.payload.id;
                            console.log(`[${chalk.green(`!`)}] ${chalk.green(statusMessages)}`)


                        } else {
                            const statusError = sendOtpWa.payload.errors[0].id;
                            console.log(`[${chalk.red(`!`)}] ${chalk.red(statusError)}`)
                        }

                    }

                } else {
                    console.log(`[${chalk.red(`!`)}] Gagal Check Akun.. Result Error Dibawah!`)
                    console.log(checkNomer.payload.errors)
                }
            } else {
                console.log(`${chalk.red(`Gagal Mendapatkan Token..`)}`)
                console.log(tokenCheck)
            }

        }
    } catch (error) {
        console.log(error)
    }
}

const features2 = async (jumlahCreateAccount, versionApk, inputCodeReff) => {
    try {
        //! FEATURES NOMER 2

        console.log()
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Kamu Memilih Feature ${chalk.yellow(`4`)}`)
        console.log();

        //!Variabel Cek Akun Berhasil dan Tidak
        let akunSuccessFillEmail = 0;
        let akunGagalFillEmail = 0;
        let akunGagal = [];

        for (let i = 1; i <= jumlahCreateAccount; i++) {
            console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`CREATE ACCOUNT FORE COFFE KE - ${i}`)}`)

            const deviceId = device();

            const tokenCheck = await getToken(versionApk, deviceId)

            if (tokenCheck.statusCode === 200) {
                const accessToken = tokenCheck.payload.access_token;
                const refreshToken = tokenCheck.payload.refresh_token;

                console.log(textGetToken(accessToken, refreshToken));

                const apiKey = process.env.API_KEY; //! ISI APIKEY SMSHUB DISINI 126871U03af54e819ce8dc11847482ab9b0304a

                //! Get Balance : Untuk melihat Balance akun
                const resultBalance = await getBalance(apiKey)

                console.log(resultBalance)
                const balance = resultBalance.split(`:`)[1]
                console.log(`[!] Saldo Akun : ${chalk.yellow(balance)}`)

                //! Get Price : Untuk melihat harga dari yang murah ke mahal
                const resultPrice = await getPrice(apiKey)
                const priceService = resultPrice[`6`].asy
                // console.log(resultPrice)
                // console.log(priceService)

                listHarga(priceService)

                let priceArray = Object.keys(priceService).map(Number); // atau map(Number);

                // console.log(keysArray.length);

                let chooseHarga = 2 //!Pilihan harga maxprice
                let selectedPrice
                if (chooseHarga >= 1 && chooseHarga <= priceArray.length) {
                    selectedPrice = priceArray[chooseHarga - 1]
                    console.log(`[!] Harga Maxprice Selected : ${chalk.green(selectedPrice)}`)
                }

                let resultCheckStatus
                let number
                do {
                    //! getNumber
                    const resultNumber = await getNumber(apiKey, selectedPrice);
                    const splitResultNumber = resultNumber.split(':');

                    const ID = splitResultNumber[1];
                    number = splitResultNumber[2];

                    console.log(successGetNumber(ID, number))

                    //! CHECK NOMER
                    const checkNomer = await getCheckNomer(accessToken, refreshToken, versionApk, deviceId, number)
                    // console.log(checkNomer)

                    if (checkNomer.payload.is_registered === 0) {
                        console.log(`[${chalk.red(`!`)}] ${chalk.red(`Akun Belum Terdaftar. Lanjut Mendaftar..`)}`)
                        // console.log()

                        //! GET SEND OTP TO SMS
                        const sendOtp = await getSendOtp(accessToken, refreshToken, versionApk, deviceId, number)
                        // console.log(sendOtp)
                        // console.log(sendOtp.payload.errors)

                        if (sendOtp.statusCode === 200) {
                            const statusMessages = sendOtp.payload.id;
                            console.log(`[${chalk.green(`!`)}] ${chalk.green(statusMessages)}`)

                            const maxWaitTime = 40000; // Maksimum waktu tunggu dalam milidetik (40 detik)
                            let startTime = Date.now()
                            do {
                                // console.log(`[!] ${chalk.yellow(`Menunggu 40 Detik Untuk OTP..`)}`);
                                // await delay(60000); // Menunggu 40 detik sebelum melanjutkan

                                //! Get Check Status Order
                                resultCheckStatus = await getStatus(apiKey, ID);
                                // console.log(resultCheckStatus);
                                console.log(`[!] ${chalk.yellow(`Waitting For OTP...`)}`)
                                await delay(3000);

                                // Cek jika waktu yang telah berlalu melebihi 40 detik
                                if (Date.now() - startTime >= maxWaitTime) {
                                    console.log('Waktu tunggu melebihi 40 detik');
                                    //! Get Change Status : Resend, Cancel, dan Success Order
                                    const resultStatus = await setStatus(apiKey, ID);
                                    // console.log(resultStatus);

                                    if (resultStatus === 'ACCESS_CANCEL') {
                                        console.log(`[!] ${chalk.red(`Order dibatalkan karena lebih dari 40 detik, mencoba lagi...`)}`);
                                        console.log();
                                        // Reset startTime untuk iterasi berikutnya
                                        startTime = Date.now();
                                        // Mengatur resultCheckStatus menjadi nilai yang berbeda dari 'STATUS_WAIT_CODE'
                                        resultCheckStatus = 'RETRY';
                                        continue; // Melanjutkan ke iterasi berikutnya dari awal loop
                                    }
                                    break; // Keluar dari loop
                                }
                            } while (resultCheckStatus === 'STATUS_WAIT_CODE' || resultCheckStatus === 'RETRY');
                        } else {
                            const statusError = sendOtp.payload.errors[0].id
                            console.log(`[${chalk.red(`!`)}] ${chalk.red(statusError)}`)
                        }
                    } else {
                        console.log(`[${chalk.green(`!`)}] ${chalk.green(`Akun Sudah Terdaftar. Lanjut Login..`)}`)
                        console.log()
                    }

                    // console.log(resultCheckStatus);
                } while (resultCheckStatus === `STATUS_CANCEL`);

                const splitResultOtp = resultCheckStatus.split(`:`)
                const kodeOTP = splitResultOtp[1]
                console.log(`[!] Kode OTP : ${chalk.green(kodeOTP)}`)

                const signUp = await getSignUp(accessToken, refreshToken, versionApk, deviceId, number, kodeOTP, inputCodeReff)

                // console.log(signUp)

                //! SIGN UP CHECK
                if (signUp.statusCode === 200) {
                    console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Registrasi Akun`)}`)

                    //!PIN AKUN GANTI DISINI

                    const pinAkun = process.env.CREATE_PIN;

                    const setPin = await getSetPin(accessToken, refreshToken, versionApk, deviceId, pinAkun)
                    // console.log(setPin)

                    //!SAVE AKUN

                    const fileName = `foreAkun.txt`
                    // const newLine = os.EOL;
                    // const data = `${number}|${pinAkun}${newLine}`

                    await savedAccount(fileName, number, pinAkun)

                    //!SET PIN
                    if (setPin.statusCode === 200) {
                        console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Set PIN`)}`)

                        //!PERULANGAN KETIKA EMAIL TIDAK VALID
                        let updateProfile;
                        do {
                            console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Fill Data Profile Akun...`)}`)

                            const domain = `gmail.com`;
                            const firstName = faker.name.lastName();
                            const lastName = faker.name.lastName();
                            const nameAkun = process.env.AKUN_NAME;
                            const fullName = `${firstName}${lastName}${await randstr(2)}`
                            const email = `${fullName}@${domain}`.toLowerCase();
                            // const email = `anjaniriyanti58@vicidiorr.com`;
                            // console.log(domain)
                            // console.log(fullName)
                            console.log(`[!] Email Use : ${chalk.green(email)}`)

                            console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Get Check Date Today..`)}`)
                            await delay(3 * 1000)

                            const date = new Date();
                            const fullDate = date.toISOString().split(`T`)[0];
                            console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`Date Today : ${fullDate}`)}`);
                            console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Set BirthDay +3 Bulan...`)}`);

                            await delay(3 * 1000)
                            // Tambah 3 bulan dan 1 hari
                            let newDate = addMonthsAndDays(date, 3, 1);

                            const birthDay = newDate.toISOString().split(`T`)[0];
                            console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`New BirthDay : ${birthDay}`)}`);

                            updateProfile = await getUpdateProfile(accessToken, refreshToken, versionApk, deviceId, nameAkun, email, birthDay)

                            if (updateProfile && updateProfile.payload && updateProfile.payload.errors) {
                                console.log(updateProfile.payload.errors);
                            } else {
                                console.log(`[${chalk.green(`!`)}] Update Profile Success..`);
                            }
                            console.log();

                        } while (updateProfile.statusCode === 500);

                        // console.log(updateProfile.payload.errors)
                        // console.log(updateProfile)
                        if (updateProfile.statusCode === 200) {
                            akunSuccessFillEmail++;
                            console.log(`[${chalk.green(`!`)}] ${chalk.green(`Success Set BirthDay Profile!`)}`)

                            const table = new Table();

                            table.push(
                                { 'User ID': updateProfile.payload.user_id },
                                { 'Username': updateProfile.payload.user_name },
                                { 'Birthday': updateProfile.payload.user_birthday },
                                { 'Code Referral': updateProfile.payload.user_code },
                                { 'Email': updateProfile.payload.user_email },
                                { 'Tanggal Akun dibuat': updateProfile.payload.created_date },
                            )

                            console.log();
                            console.log(chalk.bold('USER DATA PROFILE'));
                            console.log(table.toString());

                            const checkVoucher = await getCheckVoucher(accessToken, refreshToken, versionApk, deviceId)

                            // console.log(checkVoucher)

                            //!GET CHECK VOUCHER
                            if (checkVoucher.statusCode === 200) {
                                const tableVoucher = new Table();

                                checkVoucher.payload.data.forEach((voucher, index) => {
                                    tableVoucher.push(
                                        { 'URUTAN VOUCHER': index + 1 },
                                        { 'Voucher Code': voucher.vc_code },
                                        { 'Nama Voucher': voucher.prm_name },
                                        { 'Type Voucher': voucher.prm_campaign_type },
                                        { 'Deskripsi Voucher': voucher.prm_short_description },
                                        { 'Start Voucher': voucher.prm_start },
                                        { 'End Voucher': voucher.prm_end },
                                    )
                                });

                                console.log();
                                console.log(chalk.bold('VOUCHER AKUN FORE COFFE'));
                                console.log(tableVoucher.toString());
                                console.log()

                            } else {
                                console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Check Voucher Akun. Detail Error dibawah`)}`)
                                console.log(checkVoucher)
                            }
                        } else {

                            akunGagal.push(dataAkunGagal)
                            akunGagalFillEmail++
                            console.log(updateProfile.payload.errors)
                        }
                    } else {
                        const messageError = setPin.payload.errors[0].id
                        console.log(messageError)
                    }
                } else {
                    const messageError = signUp.payload.errors[0].id
                    console.log(messageError)
                }
            } else {
                console.log(`${chalk.red(`Gagal Mendapatkan Token..`)}`)
                console.log(tokenCheck)
            }
        }

        console.log(checkAccountFillEmail(akunSuccessFillEmail, akunGagalFillEmail))
    } catch (error) {
        console.log(error)
    }
}

const features3 = async (versionApk) => {
    try {

        console.log()
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Kamu Memilih Feature ${chalk.yellow(`3`)}`)
        console.log();

        const deviceId = device();

        const tokenCheck = await getToken(deviceId);

        // console.log(tokenCheck)
        //Input Number Manual
        //Input Number Auto
        if (tokenCheck.statusCode === 200) {
            const accessToken = tokenCheck.payload.access_token;
            const refreshToken = tokenCheck.payload.refresh_token;

            console.log(textGetToken(accessToken, refreshToken));

            const inputNumber = readlineSync.question(`[${chalk.yellow(`?`)}] Masukkan Number (${chalk.yellow(`cth : 821`)}): `)
            const checkNomer = await getCheckNomer(accessToken, refreshToken, versionApk, deviceId, inputNumber)
            // console.log(checkNomer)

            //! CHECK AKUN
            if (checkNomer.payload.is_registered === 1) {
                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Akun Sudah Terdaftar. Lanjut Login..`)}`)

                const inputPin = readlineSync.question(`[${chalk.yellow(`?`)}] Masukkan PIN Akun : `);

                const loginAkun = await getLoginAkun(accessToken, refreshToken, versionApk, deviceId, inputNumber, inputPin)
                // console.log(loginAkun)

                //! LOGIN AKUN WITH PIN
                if (loginAkun.statusCode === 200) {
                    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Success Login Akun..`)}`)


                    const profileCheck = await getCheckProfile(accessToken, refreshToken, versionApk, deviceId)
                    // console.log(profileCheck)
                    //!CHECK PROFILE
                    if (profileCheck.statusCode === 200) {
                        console.log(`${chalk.yellow(`[`)}!${chalk.yellow(`]`)} ${chalk.yellow(`Waitting Get Profile Akun..`)}`)
                        await delay(2 * 1000);
                        console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Success Get Profile Akun`)}`)

                        const checkBirthDay = profileCheck.payload.user_birthday

                        // console.log(profileCheck)
                        // console.log(checkBirthDay)
                        //!CHECK BIRTHDAY KOSONG ATAU TIDAK
                        if (checkBirthDay === null) {
                            console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} ${chalk.red(`Profile BirthDay Pada Akun Belum Diisi!`)}`)

                            const domain = `gmail.com`;
                            const firstName = faker.name.lastName();
                            const lastName = faker.name.lastName();
                            const nameAkun = process.env.AKUN_NAME;
                            const fullName = `${firstName}${lastName}${await randstr(2)}`
                            const email = `${fullName}@${domain}`.toLowerCase();
                            // console.log(domain)
                            // console.log(fullName)
                            console.log(`[!] Email Use : ${chalk.green(email)}`)

                            console.log(`${chalk.yellow(`[`)}!${chalk.yellow(`]`)} ${chalk.yellow(`Get Check Date Today..`)}`)
                            await delay(3 * 1000)

                            const date = new Date();
                            const fullDate = date.toISOString().split(`T`)[0];
                            console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`Date Today : ${fullDate}`)}`);
                            console.log(`[${chalk.yellow(`!`)}] ${chalk.yellow(`Set BirthDay +3 Bulan...`)}`);

                            await delay(3 * 1000)
                            // Tambah 3 bulan dan 1 hari
                            let newDate = addMonthsAndDays(date, 3, 1);

                            const birthDay = newDate.toISOString().split(`T`)[0];
                            console.log(`[${chalk.bold(`!`)}] ${chalk.bold(`New BirthDay : ${birthDay}`)}`);

                            const updateProfile = await getUpdateProfile(accessToken, refreshToken, versionApk, deviceId, nameAkun, email, birthDay)

                            // console.log(updateProfile.payload.errors)
                            // console.log(updateProfile)
                            if (updateProfile.statusCode === 200) {
                                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Success Set BirthDay Profile!`)}`)

                                const table = new Table();

                                table.push(
                                    { 'User ID': profileCheck.payload.user_id },
                                    { 'Username': profileCheck.payload.user_name },
                                    { 'Birthday': profileCheck.payload.user_birthday },
                                    { 'Code Referral': profileCheck.payload.user_code },
                                    { 'Email': profileCheck.payload.user_email },
                                    { 'Tanggal Akun dibuat': profileCheck.payload.created_date },
                                )

                                console.log(table)

                                console.log();
                                console.log(`${chalk.yellow(`[`)}!${chalk.yellow(`]`)} ${chalk.yellow(`USER DATA PROFILE`)}`);
                                console.log(table.toString());
                            } else {
                                console.log(updateProfile.payload.errors)
                            }

                            return;
                        }

                        const table = new Table();

                        table.push(
                            { 'User ID': profileCheck.payload.user_id },
                            { 'Username': profileCheck.payload.user_name },
                            { 'Birthday': profileCheck.payload.user_birthday },
                            { 'Code Referral': profileCheck.payload.user_code },
                            { 'Email': profileCheck.payload.user_email },
                            { 'Tanggal Akun dibuat': profileCheck.payload.created_date },
                        )

                        console.log();
                        console.log(`${chalk.yellow(`[`)}!${chalk.yellow(`]`)} ${chalk.yellow(`USER DATA PROFILE`)}`);
                        console.log(table.toString());


                        const checkVoucher = await getCheckVoucher(accessToken, refreshToken, versionApk, deviceId)

                        // console.log(checkVoucher)

                        //!GET CHECK VOUCHER
                        if (checkVoucher.statusCode === 200) {
                            const tableVoucher = new Table();

                            checkVoucher.payload.data.forEach((voucher, index) => {
                                tableVoucher.push(
                                    { 'URUTAN VOUCHER': index + 1 },
                                    { 'Voucher Code': voucher.vc_code },
                                    { 'Nama Voucher': voucher.prm_name },
                                    { 'Type Voucher': voucher.prm_campaign_type },
                                    { 'Deskripsi Voucher': voucher.prm_short_description },
                                    { 'Start Voucher': voucher.prm_start },
                                    { 'End Voucher': voucher.prm_end },
                                )
                            });

                            console.log();
                            console.log(`${chalk.yellow(`[`)}!${chalk.yellow(`]`)} ${chalk.yellow(`VOUCHER AKUN FORE COFFEE`)}`);
                            console.log(tableVoucher.toString());

                            console.log();

                            console.log(`${chalk.yellow(`[`)}!${chalk.yellow(`]`)} ${chalk.yellow(`Checking Payment Blue`)}`);

                            const resultCheckBlue = await checkPaymentBlu(accessToken, refreshToken, versionApk, deviceId)

                            // console.log(resultCheckBlue)

                            if (resultCheckBlue.payload.blu_phone_number === '') {
                                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Payment Blue Ditambahkan!`)}`);

                                const inputNomerBlue = readlineSync.question(`[${chalk.yellow(`?`)}] Masukkan Nomer Blue Kamu (cth : 821..) : `)

                                const resultAddPaymentBlue = await getAddPaymentBlue(accessToken, refreshToken, versionApk, deviceId, inputNomerBlue)

                                // console.log(resultAddPaymentBlue)

                                if (resultAddPaymentBlue.status === 'success') {
                                    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Success Menghubungkan Payment Blue`)
                                } else {
                                    console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} Gagal Menghubungkan Payment Blue`)
                                    console.log(`[!] Error Detail : ${JSON.stringify(resultAddPaymentBlue)}`)
                                    process.exit(1);
                                }
                            } else {
                                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Payment Blue Sudah Ditambahkan!`);
                            }

                            console.log();

                            let dataListOutlet = [];
                            let inputLokasi;

                            while (dataListOutlet.length === 0) {
                                inputLokasi = readlineSync.question(`[${chalk.yellow(`?`)}] Masukkan Nama Outlet : `).toLowerCase();

                                console.log();

                                const resultOutlet = await getOutlet(inputLokasi, accessToken, refreshToken, versionApk, deviceId);
                                dataListOutlet = resultListOutlet(resultOutlet);

                                if (dataListOutlet.length === 0) {
                                    console.log(`[!] Outlet tidak ditemukan, silakan coba lagi.`);
                                }
                            }

                            const listOutlet = formatOutletList(dataListOutlet, inputLokasi)

                            console.log();

                            const pilihanOutlet = readlineSync.questionInt(`[${chalk.yellow(`?`)}] Pilih nomor outlet (misal: 1): `);

                            const pilihan = pilihanOutlet - 1;

                            if (pilihan >= 0 && pilihan < dataListOutlet.length) {
                                const idOutlet = dataListOutlet[pilihan]['ID Outlet'];

                                console.log();

                                console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ID Outlet yang dipilih: ${idOutlet}`);

                                console.log();

                                const resultProductCoffee = await getProductCoffee(idOutlet, accessToken, refreshToken, versionApk, deviceId)

                                // console.log(resultProductCoffee)

                                const dataListCoffee = resultListCoffee(resultProductCoffee)

                                // console.log(dataListCoffee)

                                printCoffeeCategory(dataListCoffee)

                                const pilihanCoffee = readlineSync.question(`[${chalk.yellow(`?`)}] Pilih Menu Yang Kamu Mau (Cth : 1) : `)

                                const coffee = pilihanCoffee - 1;

                                if (coffee >= 0 && coffee < dataListCoffee.length) {
                                    const idCoffee = dataListCoffee[coffee]['ID product']

                                    const namaCoffee = dataListCoffee[coffee]['Nama product']

                                    console.log();

                                    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Kamu Memilih ${namaCoffee} Dengan Id Product ${idCoffee}`);

                                    console.log();

                                    const resultDetailCoffee = await getDetailCoffee(idCoffee, idOutlet, accessToken, refreshToken, versionApk, deviceId)

                                    // console.log(resultDetailCoffee)

                                    const pdMain = resultDetailCoffee.payload.pd_main[0]

                                    const pdId = pdMain.pd_id;

                                    // console.log(testDulu)

                                    const dataDetailProduct = getAllAdditions(pdMain)

                                    // console.log(dataDetailProduct)

                                    // console.log(pdId)

                                    // Mengambil kategori unik
                                    const detectInput = [...new Set(dataDetailProduct.map(item => item.category))];

                                    // console.log(detectInput);

                                    const hasilInput = await chooseCoffee(dataDetailProduct, detectInput)

                                    // console.log(hasilInput)

                                    const formattedAdditions = formatProductAdditions(hasilInput);

                                    // console.log(formattedAdditions)

                                    const inputVoucher = readlineSync.question(`[${chalk.yellow(`?`)}] Masukkan Kode Voucher : `)

                                    const resultDetailCheckout = await getCheckoutDetail(accessToken, refreshToken, versionApk, deviceId, idOutlet, inputVoucher, pdId, formattedAdditions)

                                    // console.log(resultDetailCheckout)

                                    const detailProduct = resultConfirmOrder(resultDetailCheckout)

                                    // console.log(detailProduct)

                                    if (resultDetailCheckout.status === `success`) {

                                        const detailConfirmProduct = resultDetailCheckout.payload.products[0]

                                        // console.log(detailConfirmProduct)

                                        const detailProduct2 = resultConfirmOrder2(detailConfirmProduct)

                                        // console.log(detailProduct2)

                                        formatProductDetails(detailProduct, detailProduct2)

                                        console.log();

                                        const resultOrder = await getCheckout(accessToken, refreshToken, versionApk, deviceId)

                                        // console.log(resultOrder)

                                        if (resultOrder.status === `success`) {
                                            const messageStatus = resultOrder.payload.message.id

                                            console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Status Order : ${messageStatus}`)
                                            console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Check BCA Blue Untuk Konfirmasi Orderan!`)

                                            console.log();

                                            const idInvoice = resultOrder.payload.uor_id

                                            // console.log(idInvoice)

                                            let checkStatusOrder
                                            let resultStatusOrder
                                            do {
                                                resultStatusOrder = await getCheckStatusOrder(idInvoice, accessToken, refreshToken, versionApk, deviceId)

                                                checkStatusOrder = resultStatusOrder.payload.uor_queue;

                                                console.log(`${chalk.yellow(`[`)}!${chalk.yellow(`]`)} ${chalk.yellow(`Menunggu Pembayaran..`)}`)

                                                await delay(2 * 1000)

                                            } while (checkStatusOrder === 0);


                                            // console.log(resultStatusOrder)

                                            const resultSuccessOrder = getOrderDetails(resultStatusOrder)

                                            console.log(resultSuccessOrder)

                                        } else {
                                            const errorMessage = resultOrder.payload.errors
                                            console.log(errorMessage)
                                        }

                                    } else {

                                        const errorMessage = resultDetailCheckout.payload.errors
                                        console.log(errorMessage)
                                    }
                                } else {
                                    console.log('Pilihan tidak valid');
                                }
                            } else {
                                console.log('Pilihan tidak valid');
                            }

                        } else {
                            console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Check Voucher Akun. Detail Error dibawah`)}`)
                            console.log(checkVoucher)
                        }
                    } else {
                        console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Check Profile Akun. Detail Error dibawah`)}`)
                        console.log(profileCheck)
                    }

                } else if (loginAkun.statusCode === 500) {
                    console.log(`[${chalk.red(`!`)}] ${chalk.red(`Gagal Login Akun. PIN Salah..`)}`)
                    console.log(loginAkun)
                }
            } else {
                console.log(`[${chalk.red(`!`)}] Gagal Check Akun.. Result Error Dibawah!`)
                console.log(checkNomer)
            }

        } else {
            console.log(`${chalk.red(`Gagal Mendapatkan Token..`)}`)
            console.log(tokenCheck)
        }

    } catch (error) {
        console.log(error)
    }
}

const features4 = async (versionApk) => {
    try {
        console.log()
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Kamu Memilih Feature ${chalk.yellow(`4`)}`)
        console.log();

        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Pastikan List Nomer dan Pin Sudah Ada di setBirthday.txt`)
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Jika belum ada setBirthday.txt buat terlebih dahulu!`)
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Jika lewat termux tinggal mkdir setBirthday.txt, lalu masuk ke setBirthday.txt dan masukin nomer dan pin`)
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Format nya adalah NOMERKAMU|PINKAMU`)
        console.log()

        const inputBirthday = readlineSync.question(`[?] Masukkan Tanggal Birthday : `)

        // Dapatkan nomor dan PIN dari file
        const numberPinPairs = getNumberAndPin();

        // Loop melalui setiap pasangan nomor dan PIN
        for (let i = 0; i < numberPinPairs.length; i++) {
            const { number, pin } = numberPinPairs[i];

            console.log(`${chalk.green(`[`)}-${chalk.green(`]`)} Set Akun Birthday Ke - ${i + 1}`);

            const deviceId = getDeviceId();
            const resultToken = await getToken(deviceId);

            if (resultToken.status === `success`) {

                console.log(`${chalk.green(`[`)}-${chalk.green(`]`)} ${chalk.green(`Success Get Token Dan Refresh Token!`)}`);

                const accessToken = resultToken.payload.access_token;
                const refreshToken = resultToken.payload.refresh_token;

                console.log(`[${chalk.blue(`*`)}] Processing Number: ${number}`);

                const resultCheckNumber = await getCheckNomer(accessToken, refreshToken, versionApk, deviceId, number);

                if (resultCheckNumber.payload.is_registered === 1) {
                    console.log(`${chalk.green(`[`)}-${chalk.green(`]`)} Akun Sudah Terdaftar. Lanjut Masukkan PIN!`);

                    const resultLogin = await getLoginAkun(accessToken, refreshToken, versionApk, deviceId, number, pin);

                    if (resultLogin.payload.code === `success`) {
                        console.log(`${chalk.green(`[`)}-${chalk.green(`]`)} Success Login Account`);

                        const resultInfoAkun = await getInfoAkun(accessToken, refreshToken, versionApk, deviceId);

                        if (resultInfoAkun.payload.user_birthday === null) {
                            console.log(`[${chalk.red(`!`)}] ${chalk.yellow(`Birthday Belum Terisi..`)}`);

                            dateNow();

                            const birthdayUse = inputBirthday;

                            console.log(`${chalk.green(`[`)}-${chalk.green(`]`)} Birthday Set : ${birthdayUse}`);

                            const randomNumber = getRandomNumber();
                            const firstName = faker.name.firstName();
                            const lastName = faker.name.lastName();
                            const nameAkun = process.env.AKUN_NAME;
                            const nameEmail = `${firstName}${lastName}`
                            const emailUse = `${nameEmail}${randomNumber}@gmail.com`;
                            const textRequest = textRequestData(nameAkun, emailUse, birthdayUse);

                            console.log();
                            console.log(textRequest);
                            console.log();

                            console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Proccess Update Profile And Set BirthDay...`);

                            await delay(2 * 1000);

                            const resultUpdateProfile = await getUpdateProfile(accessToken, refreshToken, versionApk, deviceId, nameAkun, emailUse, birthdayUse);

                            console.log();

                            if (resultUpdateProfile.status === `success`) {
                                console.log(`${chalk.green(`[`)}-${chalk.green(`]`)} Success Update Profile Dan Set Birthday!`);

                                const { user_name, user_birthday, user_code, user_email, user_phone, created_date } = resultUpdateProfile.payload;

                                const profileResult = textProfile(user_name, user_phone, user_code, user_birthday, user_email, created_date);

                                console.log(profileResult);

                            } else {
                                console.log(resultUpdateProfile);
                            }
                        } else if (resultInfoAkun.payload.user_birthday !== null) {
                            console.log(`${chalk.green(`[`)}-${chalk.green(`]`)} ${chalk.green(`Birthday Sudah Terisi..`)}`);

                            console.log();

                            const { user_name, user_birthday, user_code, user_email, user_phone, created_date } = resultInfoAkun.payload;

                            const profileResult = textProfile(user_name, user_phone, user_code, user_birthday, user_email, created_date);

                            console.log(profileResult);
                        } else {
                            console.log(resultInfoAkun);
                        }
                    } else {
                        console.log(resultLogin.payload.errors);
                    }

                } else {
                    console.log(`[${chalk.red(`!`)}] Akun Belum Terdaftar!`);
                }
            } else {
                console.log(`[${chalk.red(`!`)}] Gagal Get Token dan Refresh Token!`);
            }

            console.log();

            await delay(1 * 1000)
        }
    } catch (error) {
        console.error(`[!] Error Message : ${error}`)
    }
}

const features5 = async (versionApk) => {
    try {
        console.log()
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Kamu Memilih Feature ${chalk.yellow(`5`)}`)
        console.log();

        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Pastikan didalam folder sudah terdapat foreAkun.txt`)
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Jika belum ada foreAkun.txt buat terlebih dahulu!`)
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Jika sudah memiliki file .txt yang sudah berisikan nomer dan pin, maka tinggal rubah nama saja menjadi foreAkun.txt`)
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Format nya harus NOMERKAMU|PINKAMU`)
        console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`Note`)} : Jika sudah semuanya, Pilih y untuk start, jika belum pilih n`)
        console.log()

        const start = readlineSync.keyInYNStrict(`[?] Start Sekarang : `)

        console.log();

        if (start) {

            const deviceId = device();

            // Dapatkan nomor dan PIN dari file
            const numberPinPairs = getNumberAndPin2();

            // console.log(numberPinPairs)

            let dataReadyBirthday = [];
            let dataNotReadyBirthday = [];

            // Loop melalui setiap pasangan nomor dan PIN
            for (let i = 0; i < numberPinPairs.length; i++) {
                const { number, pin } = numberPinPairs[i];

                console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} ${chalk.yellow(`CHECK AKUN VOUCHER BIRTHDAY KE - ${i + 1}`)}`);

                const resultToken = await getToken(deviceId);

                if (resultToken.status === `success`) {

                    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Success Get Token Dan Refresh Token!`)}`);

                    const accessToken = resultToken.payload.access_token;
                    const refreshToken = resultToken.payload.refresh_token;

                    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Processing Number: ${number}`);

                    const resultCheckNumber = await getCheckNomer(accessToken, refreshToken, versionApk, deviceId, number);

                    if (resultCheckNumber.payload.is_registered === 1) {
                        console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Akun Sudah Terdaftar. Lanjut Masukkan PIN!`)}`);

                        const resultLogin = await getLoginAkun(accessToken, refreshToken, versionApk, deviceId, number, pin);

                        if (resultLogin.payload.code === `success`) {
                            console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} ${chalk.green(`Success Login Account`)}`);

                            const profileCheck = await getCheckProfile(accessToken, refreshToken, versionApk, deviceId)

                            // console.log(profileCheck)

                            if (profileCheck.statusCode === 200) {

                                const checkVoucher = await getCheckVoucher(accessToken, refreshToken, versionApk, deviceId)

                                // console.log(checkVoucher)

                                const vouchers = checkVoucher.payload.data;

                                // console.log(vouchers)

                                const birthdayVoucher = vouchers.find(voucher => voucher.prm_name.includes("Birthday Voucher"));
                                if (birthdayVoucher) {


                                    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Voucher Birthday : ${chalk.yellow(`Available`)}`);

                                    const namaVoucher = birthdayVoucher.prm_name;
                                    const startVoucher = birthdayVoucher.prm_start;
                                    const endVoucher = birthdayVoucher.prm_end;

                                    console.log(textFoundVoc(namaVoucher, startVoucher, endVoucher))

                                    dataReadyBirthday.push({ number, pin })
                                } else {
                                    console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} ${chalk.red(`Voucher Birthday Belum Tersedia`)}`);

                                    dataNotReadyBirthday.push({ number, pin })
                                }
                            } else {
                                console.log(profileCheck.payload.errors);
                            }
                        } else {
                            console.log(resultLogin.payload.errors);
                        }

                    } else {
                        console.log(`[${chalk.red(`!`)}] Akun Belum Terdaftar!`);
                    }
                } else {
                    console.log(`[${chalk.red(`!`)}] Gagal Get Token dan Refresh Token!`);
                }

                console.log();

                await delay(2 * 1000)
            }

            console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Akun yang sudah ada voucher birthday : ${chalk.yellow(dataReadyBirthday.length)}`)
            console.log(`${chalk.red(`[`)}!${chalk.red(`]`)} Akun yang belum ada voucher birthday : ${chalk.yellow(dataNotReadyBirthday.length)}`)

            console.log()

            const saveToFile = readlineSync.keyInYNStrict(`[?] Apakah Kamu Ingin Menyimpan Hasil nya : `);

            if (saveToFile) {
                const filename = readlineSync.question(`[!] Berikan Nama File (cth : readyVocBirthday) : `);
                const filePath = `${filename}.txt`;

                const formattedResults = dataReadyBirthday.map(({ number, pin }) => `${number}|${pin.trim()}`).join(os.EOL);

                fs1.writeFile(filePath, formattedResults)
                    .then(() => console.log(`${chalk.green(`[>] Data saved to ${filePath}`)}`))
                    .catch(err => console.error(`[!] Error saving file: ${err}`));
            } else {
                console.log(`${chalk.yellow(`[!] File check tidak disimpan`)}`);
            }
        } else {
            console.log(`[!] Features 5 Tidak Jadi Dijalankan`)
        }
    } catch (error) {

    }
}


const mainScript = async () => {
    try {
        const idDevice = device()

        const tokenCheck = await getToken(idDevice)

        const tokenAccess = tokenCheck.payload.access_token;
        const tokenRefresh = tokenCheck.payload.refresh_token;


        const resultVersionApk = await getVersionApk(tokenAccess, tokenRefresh);

        const versionApk = resultVersionApk.payload.code;

        console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Version Apk Fore Coffee In Android ${chalk.yellow(versionApk)}`)

        console.log();

        console.log(textFeature())

        const inputFeatures = readlineSync.questionInt(`[${chalk.yellow(`?`)}] Masukkan Pilihan Kamu : `)


        if (inputFeatures === 1) {
            //! FEATURES NOMER 1
            const jumlahCreateAccount = readlineSync.questionInt(`[${chalk.yellow(`?`)}] Mau Create Berapa Akun : `);

            const inputCodeReff = process.env.CODE_REFF;

            console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Code Refferall Yang Digunakan : ${chalk.yellow(inputCodeReff)}`)

            features1(jumlahCreateAccount, versionApk, inputCodeReff);

        } else if (inputFeatures === 2) {
            //! FEATURES NOMER 2
            //09E29F

            const jumlahCreateAccount = readlineSync.questionInt(`[${chalk.yellow(`?`)}] Mau Create Berapa Akun : `);

            const inputCodeReff = process.env.CODE_REFF;

            console.log(`${chalk.yellow(`[`)}-${chalk.yellow(`]`)} Code Refferall Yang Digunakan : ${chalk.yellow(inputCodeReff)}`)

            features2(jumlahCreateAccount, versionApk, inputCodeReff)

        } else if (inputFeatures === 3) {
            //! FEATURES NOMER 3

            features3(versionApk);

        } else if (inputFeatures === 4) {
            //! FEATURES NOMER 4

            features4(versionApk)
        } else if (inputFeatures === 5) {

            await features5(versionApk)

        } else {
            console.log(`[${chalk.red(`!`)}] ${chalk.red(`Pilihan Features Tidak Ada!`)}`)
        }

    } catch (error) {
        console.error(`[!] Error Result Disini : ${error}`)
    }
}


const runBotCode = async () => {
    console.log();

    console.log(`${chalk.green(`[`)}!${chalk.green(`]`)} Start Bot Fore Coffee`);

    await mainScript();

};

// Main Execution
(async () => {
    await mainScriptUpdate();
})();