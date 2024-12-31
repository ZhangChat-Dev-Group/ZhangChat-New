import { ConfigManager } from '.'
import { join } from 'path'

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

	this.configManager.config = this.rawData
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

	for (let i of this.permissionGroups) {
	    if (!i[1].permissions.includes(permission)) continue

	    if (!i[1].trips.includes(trip)) continue
	    else return true
    	}

	return false
    }

    registerPermission(pName) {
	if (this.permissions.has(pName)) throw new Error('权限名称重复')

	this.permissions.set(pName, [])
	return true
    }

    registerPermissionGroup(gName, permissions = []) {
	if (this.permissionGroups.has(gName)) throw new Erroe('权限组名称重复')

	this.permissionGroups.set(gName, {
	    permissions,
	    trips: [],
	})
	this.syncData()
    }

    renamePermission(pName, newName) {
	if (!this.permissions.has(pName)) throw new Error('No such permission name')
	if (this.permissions.has(newName)) throw new Error('新权限名称重复')

	let backup = this.permissions.get(pName)
	this.permissions.set(newName, backup)

	for (let i of this.permissionGroups) {
	    if (!i[1].permissions.includes(pName)) continue
	    
	    let pList = i[1].permissions.filter(pm => pm !== pName)

	    pList.push(newName)
	    i[1].permissions = pList

	    this.permissionGroups.set(i[0], i[1])
	}

	this.permissions.delete(pName)
	this.syncData()
    }

    appendPermissionToGroup(gName, ...permissions) {
	if (!this.permissionGroups.has(gName)) throw new Error('No such permission group')
	
	let group = this.permissionGroups.get(gName)
	let pList = permissions

	for (let i of pList) {
	    if (group.permissions.includes(i)) continue
	    group.permission.push(i)
	}

	this.syncData()
    }

    removePermissionFromGroup(gName, ...permissions) {
	if (!this.permissionGroups.has(gName)) throw new Error('No such permission group')

	let group = this.permissionGroups.get(gName)
	let pList = permissions

	group.permissions = group.permissions.filter(p => !pList.includes(p))
	this.permissionGroups.set(gName, group)
	this.syncData()
    }

    grant(trip, permission) {
	if (!this.permissions.has(permission)) throw new Error('No such permission name')
	
	let pm = this.permissions.get(permission)
	if (!this.hasPermission(trip, permission)) {
	    pm.push(trip)
	    this.permissions.set(permission, pm)
	    this.syncData()
	}
    }

    deprive(trip, permission) {
	if (!this.permissions.has(permission)) throw new Error('No such permission name')

	let pm = this.permissions.get(permission)
	let changed = false

	if (pm.includes(trip)) {
	    this.permissions.set(permission, pm.filter(t => t!== trip))
	    changed = true
	}

	for (let i of this.permissionGroups) {
	    if (i[1].permissions.includes(permission) && i[1].trips.includes(trip)) {
		i[1].trips = i[1].trips.filter(t => t !== trip)
		this.permissionGroups.set(i[0], i[1])
		changed = true
	    }
	}

	if (changed) this.syncData()
    }

    joinPermissionGroup(trip, group) {
	if (!this.permissionGroups.has(group)) throw new Error('No such permission group')
	if (this.inPermissionGroup(trip, group)) return
	
	this.permissionGroups.get(group).trips.push(trip)
	let pList = this.permissionGroups.get(group).permissions

	for (let i of pList) {
	    if (this.inPermission(trip, i)) {
		let oldTrips = this.permissions.get(i)
		this.permissions.set(i, oldTrips.filter(t => t !== trip))
	    }
	}

	this.syncData()
    }

    leavePermissionGroup(trip, group) {
	if (!this.permissionGroups.has(group)) throw new Error('No such permission group')
	if (!this.inPermissionGroup(trip, group)) return

	let g = this.permissionGroups.get(group)
	g.trips = g.trips.filter(t => t !== trip)

	this.permissionGroups.set(group, g)
	this.syncData()
    }
}

export default PermissionManager
