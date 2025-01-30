exports.init = permissionManager => {
    // auto register built-in permission groups
    // if they was not in permission.json

    // the prefix
    // `zhangsoft` and `zhangchat` can be replaced with your org name and your chatroom name
    // But you **MUST** obey our LICENSE 
    const prefix = 'root.zhangsoft.zhangchat.group.'
	
    if (!permissionManager.permissionGroups.has(prefix + 'mod')) permissionManager.registerPermissionGroup(prefix + 'mod', [], [ prefix + 'admin' ])
    if (!permissionManager.permissionGroups.has(prefix + 'admin')) permissionManager.registerPermissionGroup(prefix + 'admin')

    return permissionManager.save()
}
