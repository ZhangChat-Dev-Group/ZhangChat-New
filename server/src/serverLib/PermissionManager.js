import { ConfigManager } from '.'
import { json } from 'path'

class PermissionManager {
    constructor(core) {
		this.core = core

		this.rawData = {}
		this.permissions = new Map()
		this.permissionGroups = new Map()

		this.configManager = new ConfigManager(join(__dirname, '../..'), 'permission.json')
    }

    async load(autoInit = true) {
		this.rawData = await this.configManager.load()
		if (!this.rawData) {
	    	if (!autoInit) throw new Error('Failed to load permission.json')
	    	else {
				this.initFile()
				return await this.load(false)    // Don't while(true)
	    	}
		}
		this.permissions = new Map(Object.entries(this.rawData.permissions))
		this.permissionGroups = new Map(Object.entries(this.rawData.permissionGroups))
    }

    initFile() {
		this.configManager.config = {
		    permissions: {},
		    permissionGroups: {},
		}

		if (!this.save()) throw new Error('Failed to save permission.json')
    }

	syncData() {
		// Runtime data => Object
		this.rawData = {
			permissions: {},
			permissionGroups: {},
		}
		
		let setValue = (value, key, father) => this.rawData[father][key] = value

		this.permissions.forEach((value, key) => setValue(value, key, 'permissions'))
		this.permissionGroups.forEach((value, key) => setValue(value, key, 'permissionGroups'))

		this.configManager.config = rawData
	}

	save(noSync = false) {
		if (!noSync) this.syncData()
		return this.configManager.save()
	}

	inPermission(trip, permission) {
		// if (!this.permissions.has(permission)) throw new Error('No such permission name')
		if (!this.permissions.has(permission)) return false
		if (!this.permissions.get(permission).includes(trip)) return false
		else return true
	}

	inPermissionGroup(trip, permissionGroup) {
		// if (!this.permissionGroups.has(permissionGroup) throw new Error('No such permission group')
		if (!this.permissionGroups.has(permissionGroup)) return false
		
		if (!this.permissionGroups.get(permissionGroup).trips.includes(trip)) return false
		else return true
	}

	hasPermission(trip, permission) {
		if (this.inPermission(trip, permission)) return true

		for (i of this.permissionGroups) {
			if (!i[1].permissions.includes(permission)) continue
			
			if (!i[1].trips.includes(trip)) continue
			else return true
		}

		return false
	}

	registerPermission(pName, trips) {

	}
}
