let _mode = $state('js');
let _sidebarOpen = $state(false);
let _workspaceOpen = $state(false);

export function getAppState() {
  return {
    get mode() { return _mode; },
    set mode(v) { _mode = v; },
    get sidebarOpen() { return _sidebarOpen; },
    set sidebarOpen(v) { _sidebarOpen = v; },
    get workspaceOpen() { return _workspaceOpen; },
    set workspaceOpen(v) { _workspaceOpen = v; },
    toggleSidebar() { _sidebarOpen = !_sidebarOpen; },
    toggleWorkspace() { _workspaceOpen = !_workspaceOpen; },
  };
}
