import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: {
                    // General
                    welcome: "Welcome to ModernWMS",
                    loading: "Loading...",
                    save: "Save",
                    cancel: "Cancel",
                    delete: "Delete",
                    edit: "Edit",
                    create: "Create",
                    update: "Update",
                    actions: "Actions",
                    search: "Search...",
                    active: "Active",
                    inactive: "Inactive",
                    status: "Status",
                    id: "ID",
                    name: "Name",
                    confirm_delete: "Delete {{item}}?",
                    success_created: "{{item}} created",
                    success_updated: "{{item}} updated",
                    success_deleted: "{{item}} deleted",
                    error_fetch: "Failed to fetch {{item}}",
                    error_save: "Failed to save",
                    error_delete: "Failed to delete",

                    // Entities
                    customer: "Customer",
                    customers: "Customers",
                    item: "Item",
                    items: "Items",
                    item_group: "Item Group",
                    item_groups: "Item Groups",
                    zone: "Zone",
                    zones: "Zones",
                    section: "Section",
                    sections: "Sections",
                    location: "Location",
                    locations: "Locations",
                    consignee: "Consignee",
                    consignees: "Consignees",
                    facility: "Facility",
                    facilities: "Facilities",

                    // Fields
                    address: "Address",
                    city: "City",
                    state: "State",
                    phone: "Phone",
                    email: "Email",
                    sku: "SKU",
                    description: "Description",
                    uom: "Unit of Measure",
                    weight: "Weight",
                    capacity: "Capacity",
                    aisle: "Aisle",
                    rack: "Rack",
                    level: "Level",
                    bin: "Bin",
                    contact_name: "Contact Name",

                    // Facilities
                    facility_management: "Facility Management",
                    facility_management_desc: "Manage WMS distribution centers and campus locations",
                    basic_info: "Basic Info",
                    advanced_setup: "Advanced Setup",
                    operations: "Operations",
                    manager: "Manager",
                    task_limit: "Task Limit",
                    cross_dock_location: "Cross Dock Location",
                    use_location_checkdigit: "Use Location Checkdigits",
                    restrict_putaway: "Restrict Putaway",
                    remit_to_info: "Remit To Information",
                    remit_name: "Remit Name",
                    remit_address: "Remit Address",
                    active_work_days: "Active Work Days (Inbound)",
                    initialize_facility: "Initialize Facility",
                    save_changes: "Save Changes",
                    synapse_network: "Synapse Distributed Network",

                    // Plate Lookup
                    license_plate_search: "License Plate Search",
                    plate_search_desc: "Advanced filtering across the Synapse WMS inventory",
                    new_license_plate: "New License Plate",
                    contains_id: "Contains ID...",
                    contains_sku: "Contains SKU...",
                    contains_location: "Contains Location...",
                    contains_lot: "Contains Lot...",
                    all_customers: "All Customers (Active)",
                    all_facilities: "All Facilities (Active)",
                    any_status: "Any Status",
                    top_results: "Top Results",
                    search_inventory: "Search Inventory",
                    searching: "Searching...",
                    no_results: "No records found matching these criteria.",
                    plates_found: "{{count}} plates found",
                    total_qty: "Total Qty",
                    export_csv: "Export to CSV",
                    view: "View",
                    back_to_results: "Back to Results",
                    ai_operations_hub: "AI Operations Hub",
                    ai_suggested_displacement: "AI Suggested Displacement",
                    execute_ai: "Execute AI Recommendation",
                    confidence_score: "Confidence Score",
                    logic_provider: "Logic Provider",

                    // Order Entry
                    new_order_entry: "New Order Entry",
                    order_number: "Order Number",
                    item_sku: "Item SKU",
                    search_scan_sku: "Search or scan SKU...",
                    scan: "Scan",
                    ai_insight_high_demand: "AI Insight: High demand SKU. Recommended stock level: {{recommended}} units.",
                    create_transaction: "Create Transaction",

                    // Days
                    Sunday: "Sunday",
                    Monday: "Monday",
                    Tuesday: "Tuesday",
                    Wednesday: "Wednesday",
                    Thursday: "Thursday",
                    Friday: "Friday",
                    Saturday: "Saturday",

                    // Navigation
                    dashboard: "Dashboard",
                    inventory: "Inventory",
                    orders: "Orders",
                    settings: "Settings",
                    master_data: "Master Data",
                    operations: "Operations",
                    plate_lookup: "Plate Lookup",
                    partners: "Partners",
                    facility_config: "Facility Configuration",

                    // Theme
                    light_mode: "Light Mode",
                    dark_mode: "Dark Mode",
                    plexus_theme: "Plexus",

                    // Language
                    english: "English",
                    spanish: "Spanish",

                    // Dashboard
                    real_time_ops_overview: "Real-time Operational Overview",
                    global_inventory: "Global Inventory",
                    total_units_stock: "Total Units in Stock",
                    ai_demand_forecast: "AI-Powered Demand Forecast",
                    predicted_sku_velocity: "Predicted SKU Velocity",
                    active_orders: "Active Orders",
                    pending_receiving: "Pending Receiving",
                    inventory_distribution: "Inventory Distribution",
                    quantity: "Quantity"
                }
            },
            es: {
                translation: {
                    // General
                    welcome: "Bienvenido a ModernWMS",
                    loading: "Cargando...",
                    save: "Guardar",
                    cancel: "Cancelar",
                    delete: "Eliminar",
                    edit: "Editar",
                    create: "Crear",
                    update: "Actualizar",
                    actions: "Acciones",
                    search: "Buscar...",
                    active: "Activo",
                    inactive: "Inactivo",
                    status: "Estado",
                    id: "ID",
                    name: "Nombre",
                    confirm_delete: "¿Eliminar {{item}}?",
                    success_created: "{{item}} creado",
                    success_updated: "{{item}} actualizado",
                    success_deleted: "{{item}} eliminado",
                    error_fetch: "Error al cargar {{item}}",
                    error_save: "Error al guardar",
                    error_delete: "Error al eliminar",

                    // Entities
                    customer: "Cliente",
                    customers: "Clientes",
                    item: "Artículo",
                    items: "Artículos",
                    item_group: "Grupo de Artículos",
                    item_groups: "Grupos de Artículos",
                    zone: "Zona",
                    zones: "Zonas",
                    section: "Sección",
                    sections: "Secciones",
                    location: "Ubicación",
                    locations: "Ubicaciones",
                    consignee: "Consignatario",
                    consignees: "Consignatarios",
                    facility: "Instalación",
                    facilities: "Instalaciones",
                    plate: "Placa",

                    // Fields
                    address: "Dirección",
                    city: "Ciudad",
                    state: "Estado/Provincia",
                    phone: "Teléfono",
                    email: "Correo",
                    sku: "SKU",
                    description: "Descripción",
                    uom: "Unidad de Medida",
                    weight: "Peso",
                    capacity: "Capacidad",
                    aisle: "Pasillo",
                    rack: "Estante",
                    level: "Nivel",
                    bin: "Casillero",
                    contact_name: "Nombre de Contacto",

                    // Facilities
                    facility_management: "Gestión de Instalaciones",
                    facility_management_desc: "Administrar centros de distribución y ubicaciones del campus",
                    basic_info: "Información Básica",
                    advanced_setup: "Configuración Avanzada",
                    operations: "Operaciones",
                    manager: "Gerente",
                    task_limit: "Límite de Tareas",
                    cross_dock_location: "Ubicación Cross Dock",
                    use_location_checkdigit: "Usar Dígitos de Control de Ubicación",
                    restrict_putaway: "Restringir Almacenamiento",
                    remit_to_info: "Información de Remitente",
                    remit_name: "Nombre Remitente",
                    remit_address: "Dirección Remitente",
                    active_work_days: "Días Laborables Activos (Entrada)",
                    initialize_facility: "Inicializar Instalación",
                    save_changes: "Guardar Cambios",
                    synapse_network: "Red Distribuida Synapse",

                    // Plate Lookup
                    license_plate_search: "Búsqueda de Placas",
                    plate_search_desc: "Filtrado avanzado en el inventario de Synapse WMS",
                    new_license_plate: "Nueva Placa",
                    contains_id: "Contiene ID...",
                    contains_sku: "Contiene SKU...",
                    contains_location: "Contiene Ubicación...",
                    contains_lot: "Contiene Lote...",
                    all_customers: "Todos los Clientes (Activos)",
                    all_facilities: "Todas las Instalaciones (Activas)",
                    any_status: "Cualquier Estado",
                    top_results: "Resultados Principales",
                    search_inventory: "Buscar Inventario",
                    searching: "Buscando...",
                    no_results: "No se encontraron registros.",
                    plates_found: "{{count}} placas encontradas",
                    total_qty: "Cant. Total",
                    export_csv: "Exportar a CSV",
                    view: "Ver",
                    back_to_results: "Volver a Resultados",
                    ai_operations_hub: "Centro de Operaciones IA",
                    ai_suggested_displacement: "Desplazamiento Sugerido por IA",
                    execute_ai: "Ejecutar Recomendación IA",
                    confidence_score: "Puntaje de Confianza",
                    logic_provider: "Proveedor de Lógica",

                    // Order Entry
                    new_order_entry: "Nueva Entrada de Pedido",
                    order_number: "Número de Pedido",
                    item_sku: "SKU del Artículo",
                    search_scan_sku: "Buscar o escanear SKU...",
                    scan: "Escanear",
                    ai_insight_high_demand: "Insight IA: SKU de alta demanda. Nivel de stock recomendado: {{recommended}} unidades.",
                    create_transaction: "Crear Transacción",

                    // Days
                    Sunday: "Domingo",
                    Monday: "Lunes",
                    Tuesday: "Martes",
                    Wednesday: "Miércoles",
                    Thursday: "Jueves",
                    Friday: "Viernes",
                    Saturday: "Sábado",

                    // Navigation
                    dashboard: "Panel",
                    inventory: "Inventario",
                    orders: "Pedidos",
                    settings: "Configuración",
                    master_data: "Datos Maestros",
                    operations: "Operaciones",
                    plate_lookup: "Consulta de Placa",
                    partners: "Socios",
                    facility_config: "Configuración de Instalación",

                    // Theme
                    light_mode: "Modo Claro",
                    dark_mode: "Modo Oscuro",
                    plexus_theme: "Plexus",

                    // Language
                    english: "Inglés",
                    spanish: "Español",

                    // Dashboard
                    real_time_ops_overview: "Resumen Operativo en Tiempo Real",
                    global_inventory: "Inventario Global",
                    total_units_stock: "Total Unidades en Stock",
                    ai_demand_forecast: "Pronóstico de Demanda IA",
                    predicted_sku_velocity: "Velocidad de SKU Predicha",
                    active_orders: "Pedidos Activos",
                    pending_receiving: "Recepción Pendiente",
                    inventory_distribution: "Distribución de Inventario",
                    quantity: "Cantidad"
                }
            }
        }
    });

export default i18n;
