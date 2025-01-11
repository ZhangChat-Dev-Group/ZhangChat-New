exports.init = permissionManager => {
    // auto register built-in permission groups
    // if they was not in permission.json

    // the prefix
    // `zhangsoft` and `zhangchat` can be replaced with your org name and your chatroom name
    // But you **MUST** obey our LICENSE 
    const prefix = 'root.zhangsoft.zhangchat.group.'
    const builtInGroups = [ 'admin', 'mod' ]

    for (i of builtInGroups) {
	if (permissionManager.permissionGroups.has(prefix + i)) continue
	permissionManager.registerPermissionGroup(prefix + i)
    }

    return permissionManager.save()
}
