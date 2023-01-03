const {existsSync, readFileSync} = require('fs')
const {resolve, dirname, relative} = require('path')

const {platform, arch} = process

let nativeBinding = null
let localFileExisted = false
let loadError = null
let localBinPath = "";

function isMusl() {
	// For Node 10
	if(!process.report || typeof process.report.getReport !== 'function') {
		try {
			const lddPath = require('child_process').execSync('which ldd').toString().trim();
			return readFileSync(lddPath, 'utf8').includes('musl')
		} catch(e) {
			return true
		}
	} else {
		const {glibcVersionRuntime} = process.report.getReport().header
		return !glibcVersionRuntime
	}
}

switch(platform) {
	case 'android':
		switch(arch) {
			case 'arm64':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'android-arm64', 'node-wry.android-arm64.node')
				localFileExisted = existsSync(localBinPath);
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-android-arm64')
					}
				} catch(e) {
					loadError = e
				}
				break
			case 'arm':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'android-arm-eabi', 'node-wry.android-arm-eabi.node')
				localFileExisted = existsSync(localBinPath)
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-android-arm-eabi')
					}
				} catch(e) {
					loadError = e
				}
				break
			default:
				throw new Error(`Unsupported architecture on Android ${arch}`)
		}
		break
	case 'win32':
		switch(arch) {
			case 'x64':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'win32-x64-msvc', 'node-wry.win32-x64-msvc.node')
				localFileExisted = existsSync(localBinPath)
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-win32-x64-msvc')
					}
				} catch(e) {
					loadError = e
				}
				break
			case 'ia32':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'win32-ia32-msvc', 'node-wry.win32-ia32-msvc.node')
				localFileExisted = existsSync(localBinPath)
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-win32-ia32-msvc')
					}
				} catch(e) {
					loadError = e
				}
				break
			case 'arm64':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'win32-arm64-msvc', 'node-wry.win32-arm64-msvc.node')
				localFileExisted = existsSync(localBinPath)
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-win32-arm64-msvc')
					}
				} catch(e) {
					loadError = e
				}
				break
			default:
				throw new Error(`Unsupported architecture on Windows: ${arch}`)
		}
		break
	case 'darwin':
		localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'darwin-universal', 'node-wry.darwin-universal.node')
		localFileExisted = existsSync(localBinPath)
		try {
			if(localFileExisted) {
				nativeBinding = require(`${localBinPath}`)
			} else {
				nativeBinding = require('@thebrenny/node-wry-darwin-universal')
			}
			break
		} catch {}
		switch(arch) {
			case 'x64':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'darwin-x64', 'node-wry.darwin-x64.node')
				localFileExisted = existsSync(localBinPath)
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-darwin-x64')
					}
				} catch(e) {
					loadError = e
				}
				break
			case 'arm64':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'darwin-arm64', 'node-wry.darwin-arm64.node')
				localFileExisted = existsSync(localBinPath)
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-darwin-arm64')
					}
				} catch(e) {
					loadError = e
				}
				break
			default:
				throw new Error(`Unsupported architecture on macOS: ${arch}`)
		}
		break
	case 'freebsd':
		if(arch !== 'x64') {
			throw new Error(`Unsupported architecture on FreeBSD: ${arch}`)
		}
		localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'freebsd-x64', 'node-wry.freebsd-x64.node')
		localFileExisted = existsSync(localBinPath)
		try {
			if(localFileExisted) {
				nativeBinding = require(`${localBinPath}`)
			} else {
				nativeBinding = require('@thebrenny/node-wry-freebsd-x64')
			}
		} catch(e) {
			loadError = e
		}
		break
	case 'linux':
		switch(arch) {
			case 'x64':
				if(isMusl()) {
					localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'linux-x64-musl', 'node-wry.linux-x64-musl.node')
					localFileExisted = existsSync(localBinPath)
					try {
						if(localFileExisted) {
							nativeBinding = require(`${localBinPath}`)
						} else {
							nativeBinding = require('@thebrenny/node-wry-linux-x64-musl')
						}
					} catch(e) {
						loadError = e
					}
				} else {
					localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'linux-x64-gnu', 'node-wry.linux-x64-gnu.node')
					localFileExisted = existsSync(localBinPath)
					try {
						if(localFileExisted) {
							nativeBinding = require(`${localBinPath}`)
						} else {
							nativeBinding = require('@thebrenny/node-wry-linux-x64-gnu')
						}
					} catch(e) {
						loadError = e
					}
				}
				break
			case 'arm64':
				if(isMusl()) {
					localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'linux-arm64-musl', 'node-wry.linux-arm64-musl.node')
					localFileExisted = existsSync(localBinPath)
					try {
						if(localFileExisted) {
							nativeBinding = require(`${localBinPath}`)
						} else {
							nativeBinding = require('@thebrenny/node-wry-linux-arm64-musl')
						}
					} catch(e) {
						loadError = e
					}
				} else {
					localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'linux-arm64-gnu', 'node-wry.linux-arm64-gnu.node')
					localFileExisted = existsSync(localBinPath)
					try {
						if(localFileExisted) {
							nativeBinding = require(`${localBinPath}`)
						} else {
							nativeBinding = require('@thebrenny/node-wry-linux-arm64-gnu')
						}
					} catch(e) {
						loadError = e
					}
				}
				break
			case 'arm':
				localBinPath = resolve(__dirname, dirname('..\\..\\..'), 'npm', 'linux-arm-gnueabihf', 'node-wry.linux-arm-gnueabihf.node')
				localFileExisted = existsSync(localBinPath)
				try {
					if(localFileExisted) {
						nativeBinding = require(`${localBinPath}`)
					} else {
						nativeBinding = require('@thebrenny/node-wry-linux-arm-gnueabihf')
					}
				} catch(e) {
					loadError = e
				}
				break
			default:
				throw new Error(`Unsupported architecture on Linux: ${arch}`)
		}
		break
	default:
		throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`)
}

if(!nativeBinding) {
	if(loadError) {
		throw loadError
	}
	throw new Error(`Failed to load native binding`)
}

const { WebView } = nativeBinding

module.exports.WebView = WebView
