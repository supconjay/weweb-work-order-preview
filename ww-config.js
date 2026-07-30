export default {
  editor: { label: { en: "Work Order Preview" } },
  triggerEvents: [
    { name: "fieldChange", label: { en: "On field edited" }, event: { field: "", key: "", previous: "", value: "" } },
    { name: "noteSubmit", label: { en: "On note posted" }, event: { id: "", text: "", html: "", mentions: [], mentionIds: [], files: [], attachments: [] } },
    { name: "activityPageChange", label: { en: "On activity page change" }, event: { page: 1 } },
    { name: "attachmentClick", label: { en: "On activity attachment click" }, event: { url: "", type: "", filename: "", isImage: false, attachment: {} } },
    { name: "primaryAction", label: { en: "On primary action (Schedule)" }, event: { id: "", workOrder: {} } },
    { name: "secondaryAction", label: { en: "On secondary action (Cancel)" }, event: { id: "", workOrder: {} } },
  ],
  properties: {
    // ---- Work order record ----
    // Accepts a single record, a WeWeb collection { data: [...] }, or an array
    // (first row is used).
    workOrder: {
      label: { en: "Work order (record)" }, type: "Object", bindable: true,
      defaultValue: {
        display: "JOB#4434 - 3",
        external_id_from_project: ["WO#"],
        customer_name: ["Charlie Binder"],
        Notes: "",
        emergency: [null],
        Status: "Unscheduled",
        address_string: "97 Autumn Woods Drive, Dallas, GA 30157, USA",
        assigned_to_name: ["Walter Gaw"],
        portal_lookup: [null],
        work_order_assignee_name: ["Check Electric"],
        id: "recRd52NWP9AeijDH",
      },
    },
    idField: { label: { en: "Field: id" }, type: "Text", defaultValue: "id", bindable: true, section: "settings" },

    // ---- Header (optional; the modal already shows the title) ----
    showHeader: { label: { en: "Show header (title + status)" }, type: "OnOff", defaultValue: false, bindable: true },
    title: { label: { en: "Fallback title" }, type: "Text", defaultValue: "Work Order", bindable: true },
    displayField: { label: { en: "Field: title / display" }, type: "Text", defaultValue: "display", bindable: true, section: "settings" },

    // ---- Work order field mapping ----
    woField: { label: { en: "Field: WO# (editable)" }, type: "Text", defaultValue: "external_id_from_project", bindable: true, section: "settings" },
    woLabel: { label: { en: "Label: WO#" }, type: "Text", defaultValue: "WO#", bindable: true },
    customerField: { label: { en: "Field: customer" }, type: "Text", defaultValue: "customer_name", bindable: true, section: "settings" },
    customerLabel: { label: { en: "Label: customer" }, type: "Text", defaultValue: "Customer", bindable: true },
    descriptionField: { label: { en: "Field: description (editable)" }, type: "Text", defaultValue: "Notes", bindable: true, section: "settings" },
    descriptionLabel: { label: { en: "Label: description" }, type: "Text", defaultValue: "Description", bindable: true },
    emergencyField: { label: { en: "Field: emergency (editable)" }, type: "Text", defaultValue: "emergency", bindable: true, section: "settings" },
    emergencyLabel: { label: { en: "Label: emergency" }, type: "Text", defaultValue: "Emergency", bindable: true },
    emergencyYes: { label: { en: "Emergency on text" }, type: "Text", defaultValue: "Yes", bindable: true },
    emergencyNo: { label: { en: "Emergency off text" }, type: "Text", defaultValue: "No", bindable: true },
    statusField: { label: { en: "Field: status" }, type: "Text", defaultValue: "Status", bindable: true, section: "settings" },
    statusLabel: { label: { en: "Label: status" }, type: "Text", defaultValue: "Status", bindable: true },
    locationField: { label: { en: "Field: location" }, type: "Text", defaultValue: "address_string", bindable: true, section: "settings" },
    locationLabel: { label: { en: "Label: location" }, type: "Text", defaultValue: "Location", bindable: true },
    managerField: { label: { en: "Field: account manager" }, type: "Text", defaultValue: "assigned_to_name", bindable: true, section: "settings" },
    managerLabel: { label: { en: "Label: account manager" }, type: "Text", defaultValue: "Account Manager", bindable: true },
    portalField: { label: { en: "Field: portal (editable)" }, type: "Text", defaultValue: "portal_lookup", bindable: true, section: "settings" },
    portalLabel: { label: { en: "Label: portal" }, type: "Text", defaultValue: "Portal", bindable: true },

    editable: { label: { en: "Allow inline editing" }, type: "OnOff", defaultValue: true, bindable: true },

    // ---- Vendor Information ----
    showVendor: { label: { en: "Show vendor card" }, type: "OnOff", defaultValue: true, bindable: true },
    vendorTitle: { label: { en: "Vendor card title" }, type: "Text", defaultValue: "Vendor Information", bindable: true },
    vendorNameField: { label: { en: "Field: vendor name" }, type: "Text", defaultValue: "work_order_assignee_name", bindable: true, section: "settings" },
    vendorName: { label: { en: "Vendor name (override, bindable)" }, type: "Text", defaultValue: "", bindable: true },
    vendorEmail: { label: { en: "Vendor email (bindable)" }, type: "Text", defaultValue: "accounts@checkelectric.com", bindable: true },
    vendorPhone: { label: { en: "Vendor phone (bindable)" }, type: "Text", defaultValue: "(470) 744-1030", bindable: true },

    // ---- Tenant Information (bindable) ----
    showTenant: { label: { en: "Show tenant card" }, type: "OnOff", defaultValue: true, bindable: true },
    tenantTitle: { label: { en: "Tenant card title" }, type: "Text", defaultValue: "Tenant Information", bindable: true },
    // Bind the tenant record (from property_contacts). Accepts object, array, or
    // collection { data: [...] }. Name/email/phone are read via the field maps,
    // or override directly with the text props below.
    tenant: {
      label: { en: "Tenant (record, bind)" }, type: "Object", bindable: true, section: "settings",
      defaultValue: { name: "Charlie Binder", email: "", phone: "470-448-7423" },
    },
    tenantNameField: { label: { en: "Field: tenant name" }, type: "Text", defaultValue: "name", bindable: true, section: "settings" },
    tenantEmailField: { label: { en: "Field: tenant email" }, type: "Text", defaultValue: "email", bindable: true, section: "settings" },
    tenantPhoneField: { label: { en: "Field: tenant phone" }, type: "Text", defaultValue: "phone", bindable: true, section: "settings" },
    tenantName: { label: { en: "Tenant name (override)" }, type: "Text", defaultValue: "", bindable: true },
    tenantEmail: { label: { en: "Tenant email (override)" }, type: "Text", defaultValue: "", bindable: true },
    tenantPhone: { label: { en: "Tenant phone (override)" }, type: "Text", defaultValue: "", bindable: true },

    emailEmptyText: { label: { en: "Email-missing text" }, type: "Text", defaultValue: "Email not available", bindable: true },
    phoneEmptyText: { label: { en: "Phone-missing text" }, type: "Text", defaultValue: "Phone not available", bindable: true },

    // ---- Activity feed (bindable; mirrors Tracker Viewer) ----
    showActivity: { label: { en: "Show activity feed" }, type: "OnOff", defaultValue: true, bindable: true },
    activityTitle: { label: { en: "Activity title" }, type: "Text", defaultValue: "Activity", bindable: true },
    // Records: { author | user_id.name, avatar | user_id.headshot, activity/action,
    //   text/description, created_at, attachments: [{ url, content_type, thumbnails }] }
    activity: {
      label: { en: "Activity feed (list, bind)" }, type: "Array", bindable: true,
      defaultValue: [
        { id: "a1", author: "Walter Gaw", activity: "Status change", description: "Work order created and set to Unscheduled.", created_at: "2026-07-24T13:10:00+00:00", attachments: [] },
        { id: "a2", author: "Jay Helvey", activity: "Note", description: "Vendor confirmed availability for next week.", created_at: "2026-07-25T09:30:00+00:00", attachments: [] },
      ],
    },
    activityHtml: { label: { en: "Render activity body as HTML" }, type: "OnOff", defaultValue: true, bindable: true },
    paginateActivity: { label: { en: "Paginate activity" }, type: "OnOff", defaultValue: true, bindable: true },
    activityPageSize: { label: { en: "Activity items per page" }, type: "Number", options: { min: 1, max: 100, step: 1 }, defaultValue: 5, bindable: true },
    activityEmptyText: { label: { en: "Activity empty text" }, type: "Text", defaultValue: "No activity yet", bindable: true },

    // ---- Note composer (input box at top of the activity feed) ----
    showComposer: { label: { en: "Show note composer" }, type: "OnOff", defaultValue: true, bindable: true },
    composerPlaceholder: { label: { en: "Composer placeholder" }, type: "Text", defaultValue: "Write a note…  type @ to mention someone", bindable: true },
    submitLabel: { label: { en: "Post button label" }, type: "Text", defaultValue: "Post Note", bindable: true },
    allowAttachments: { label: { en: "Allow attachments" }, type: "OnOff", defaultValue: true, bindable: true },
    attachHint: { label: { en: "Attachment drop hint" }, type: "Text", defaultValue: "Drop your attachment here or click to browse", bindable: true },
    currentUserName: { label: { en: "Current user name" }, type: "Text", defaultValue: "", bindable: true },
    currentUserAvatar: { label: { en: "Current user avatar (url)" }, type: "Text", defaultValue: "", bindable: true },
    // @mention people source (array or collection { data: [...] }).
    users: { label: { en: "Mention people (list, bind)" }, type: "Array", bindable: true, section: "settings", defaultValue: [] },
    userLabelField: { label: { en: "Field: person name" }, type: "Text", defaultValue: "name", bindable: true, section: "settings" },
    userValueField: { label: { en: "Field: person id" }, type: "Text", defaultValue: "user_auth_id", bindable: true, section: "settings" },
    userAvatarField: { label: { en: "Field: person avatar" }, type: "Text", defaultValue: "headshot", bindable: true, section: "settings" },
    userSubtitleField: { label: { en: "Field: person subtitle" }, type: "Text", defaultValue: "", bindable: true, section: "settings" },

    // ---- Footer actions (optional; off if the modal has its own buttons) ----
    showActions: { label: { en: "Show footer actions" }, type: "OnOff", defaultValue: false, bindable: true },
    primaryLabel: { label: { en: "Primary action label" }, type: "Text", defaultValue: "Schedule", bindable: true },
    secondaryLabel: { label: { en: "Secondary action label" }, type: "Text", defaultValue: "Cancel", bindable: true },

    // ---- Theme (standard across pp- components) ----
    primaryColor: { label: { en: "Primary color" }, type: "Color", defaultValue: "#10b981", bindable: true },
    accentColor: { label: { en: "Accent color" }, type: "Color", defaultValue: "#6366f1", bindable: true },
    darkMode: {
      label: { en: "Theme mode" }, type: "TextSelect",
      options: { options: [
        { value: "auto", label: { en: "Auto (system)" } },
        { value: "light", label: { en: "Light" } },
        { value: "dark", label: { en: "Dark" } },
      ] }, defaultValue: "auto", bindable: true,
    },
    radius: { label: { en: "Corner radius (px)" }, type: "Number", options: { min: 0, max: 32, step: 1 }, defaultValue: 16, bindable: true },
  },
};
