Toggles = {
  id: null,
  version: null,
  rootURI: null,
  initialized: false,
  tab_bar_visible: true,
  annotation_bar_visible: true,
  addedElementIDs: [],

  init({ id, version, rootURI }) {
    if (this.initialized) return;
    this.id = id;
    this.version = version;
    this.rootURI = rootURI;
    this.initialized = true;
  },

  log(msg) {
    Zotero.debug("Make It Red: " + msg);
  },

  addMenuItems(window) {
    let doc = window.document;

    // Tab Bar Toggle
    let tab_bar_item = doc.createXULElement('menuitem');
    tab_bar_item.id = 'toggle-tab';
    tab_bar_item.setAttribute('data-l10n-id', 'toggle-tab');
    tab_bar_item.addEventListener('command', () => {
      Toggles.toggleTabBar(doc);
    });
    doc.getElementById('menu_viewPopup').appendChild(tab_bar_item);
    this.storeAddedElement(tab_bar_item);

    // Annotation Tool Bar Toggle
    let annotation_tool_bar = doc.createXULElement('menuitem');
    annotation_tool_bar.id = 'toggle-ann';
    annotation_tool_bar.setAttribute('data-l10n-id', 'toggle-ann');
    annotation_tool_bar.addEventListener('command', () => {
      Toggles.toggleAnnotation(annotation_tool_bar.checked);
    });
    doc.getElementById('menu_viewPopup').appendChild(annotation_tool_bar);
    this.storeAddedElement(annotation_tool_bar);

    // Sidebar toggle
    let side_bar_toggle = doc.createXULElement('menuitem');
    side_bar_toggle.id = 'toggle-sidebar';
    side_bar_toggle.setAttribute('data-l10n-id', 'toggle-sidebar');
    side_bar_toggle.addEventListener('command', () => {
      Toggles.toggleSidebar();
    });
    doc.getElementById('menu_viewPopup').appendChild(side_bar_toggle);
    this.storeAddedElement(side_bar_toggle);
  },

  toggleTabBar(doc, on) {
    let title_bar = doc.getElementById("zotero-title-bar")
    if (this.tab_bar_visible) {
      title_bar.style.display = "none"
      this.tab_bar_visible = false

    } else {
      title_bar.setAttribute("style", "")
      this.tab_bar_visible = true;
    }

  },

  toggleAnnotation(on) {
    // let tab_id = Zotero.getMainWindow().Zotero_Tabs._selectedID 
    // let doc = Zotero.Reader.getByTabID(tab_id)._iframeWindow.document
    
    Zotero.Reader._readers.forEach(reader => {
      let doc = reader._iframeWindow.document;

      if (Toggles.annotation_bar_visible) {
        reader._iframeWindow.eval(
          "document.getElementById('fix-popup')?.remove(); let style = document.createElement('style'); style.id = 'fix-popup'; style.innerHTML = '.view-popup {margin-top: -40px;}'; document.head.appendChild(style)"
        )
        if (doc.querySelector(".toolbar")) {
          doc.querySelector(".toolbar").style.display = "none"
        }
        if (doc.querySelector("#split-view")) {
          doc.querySelector("#split-view").style.top = "0"
        }
        if (doc.querySelector("#sidebarContainer")) {
          doc.querySelector("#sidebarContainer").style.top = "0"
        }
      } else {
        reader._iframeWindow.eval(
          "document.getElementById('fix-popup')?.remove()"
        )
        doc.querySelector(".toolbar")?.setAttribute("style", "")
        doc.querySelector("#split-view")?.setAttribute("style", "")
        doc.querySelector("#sidebarContainer")?.setAttribute("style", "")
      }

    });

    this.annotation_bar_visible = !this.annotation_bar_visible;
  },

  toggleSidebar() {
    Zotero.Reader.toggleSidebar();
  },

  addToWindow(window) {
    // Use Fluent for localization
    window.MozXULElement.insertFTLIfNeeded("toggles.ftl");

    this.addMenuItems(window);
  },

  addToAllWindows() {
    var windows = Zotero.getMainWindows();
    for (let win of windows) {
      if (!win.ZoteroPane) continue;
      this.addToWindow(win);
    }
  },

  storeAddedElement(elem) {
    if (!elem.id) {
      throw new Error("Element must have an id");
    }
    this.addedElementIDs.push(elem.id);
  },

  removeFromWindow(window) {
    var doc = window.document;
    // Remove all elements added to DOM
    for (let id of this.addedElementIDs) {
      doc.getElementById(id)?.remove();
    }
    doc.querySelector('[href="toggles.ftl"]').remove();
  },

  removeFromAllWindows() {
    var windows = Zotero.getMainWindows();
    for (let win of windows) {
      if (!win.ZoteroPane) continue;
      this.removeFromWindow(win);
    }
  },

  async main() {
    // Global properties are included automatically in Zotero 7
    // var host = new URL('https://foo.com/path').host;
    // this.log(`Host is ${host}`);

    // // Retrieve a global pref
    // this.log(`Intensity is ${Zotero.Prefs.get('extensions.make-it-red.intensity', true)}`);
  },
};
