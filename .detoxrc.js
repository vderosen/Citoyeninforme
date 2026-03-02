/** @type {Detox.DetoxConfig} */
module.exports = {
    testRunner: {
        args: {
            '$0': 'jest',
            config: 'e2e/jest.config.js'
        },
        jest: {
            setupTimeout: 120000
        }
    },
    apps: {
        'ios.debug': {
            type: 'ios.app',
            binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/CitoyenInform.app',
            build: 'xcodebuild -workspace ios/CitoyenInform.xcworkspace -scheme CitoyenInform -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
        },
        'android.debug': {
            type: 'android.apk',
            binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
            build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
            reversePorts: [
                8081
            ]
        }
    },
    devices: {
        simulatorSmall: {
            type: 'ios.simulator',
            device: {
                type: 'iPhone SE (2nd generation)'
            }
        },
        simulator: {
            type: 'ios.simulator',
            device: {
                type: 'iPhone 16'
            }
        },
        simulatorLarge: {
            type: 'ios.simulator',
            device: {
                type: 'iPhone 16 Pro Max'
            }
        },
        attached: {
            type: 'android.attached',
            device: {
                adbName: '.*'
            }
        },
        emulator: {
            type: 'android.emulator',
            device: {
                avdName: 'Pixel_6_API_34'
            }
        }
    },
    configurations: {
        'ios.sim.debug.small': {
            device: 'simulatorSmall',
            app: 'ios.debug'
        },
        'ios.sim.debug': {
            device: 'simulator',
            app: 'ios.debug'
        },
        'ios.sim.debug.large': {
            device: 'simulatorLarge',
            app: 'ios.debug'
        },
        'android.att.debug': {
            device: 'attached',
            app: 'android.debug'
        },
        'android.emu.debug': {
            device: 'emulator',
            app: 'android.debug'
        }
    }
};
