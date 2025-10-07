
<script>
/**
 * @file app.js
 * @description Lógica de frontend común para todas las páginas de la aplicación.
 * Proporciona un objeto 'App' con helpers para:
 * - Llamar a funciones de `google.script.run` de forma segura.
 * - Mostrar indicadores de carga y mensajes de error/éxito.
 * - Gestionar modales.
 *
 * INSTALACIÓN:
 * Este script se incluye al final de cada archivo .html usando `<?!= incluir('app.js') ?>`.
 */
const App = {
  /**
   * Ejecuta una función del backend (Code.gs) usando google.script.run.
   * @param {string} functionName - Nombre de la función en el backend.
   * @param {any} params - Parámetros para la función.
   * @param {function} onSuccess - Callback en caso de éxito.
   * @param {function} onFailure - Callback en caso de error.
   */
  run: function(functionName, params, onSuccess, onFailure) {
    // Si onFailure no se proporciona, usa el manejador de errores por defecto.
    const failureHandler = onFailure || this.showError;
    
    google.script.run
      .withSuccessHandler(onSuccess)
      .withFailureHandler(failureHandler)
      [functionName](params);
  },

  /**
   * Muestra un indicador de carga a pantalla completa.
   * @param {string} message - Mensaje a mostrar (opcional).
   */
  showLoading: function(message = 'Procesando...') {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.id = 'loading-spinner';
      spinner.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span id="loading-message" class="mt-2">${message}</span>`;
      document.body.appendChild(spinner);
    }
    spinner.querySelector('#loading-message').textContent = message;
    spinner.classList.remove('hidden');
  },

  /**
   * Oculta el indicador de carga.
   */
  hideLoading: function() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.classList.add('hidden');
    }
  },

  /**
   * Muestra un mensaje de error.
   * @param {Error|string} error - El objeto de error o un mensaje.
   */
  showError: function(error) {
    this.hideLoading();
    const errorMessage = typeof error === 'object' ? error.message : error;
    console.error('Error:', error);
    alert('Error: ' + errorMessage); // Se puede reemplazar por un toast/notificación más elegante.
  },
  
  /**
   * Muestra un mensaje de éxito.
   * @param {string} message - El mensaje a mostrar.
   */
  showSuccess: function(message) {
      this.hideLoading();
      alert('Éxito: ' + message); // Reemplazar por un toast.
  },

  /**
   * Controlador para un componente de modal.
   * @param {string} modalId - El ID del contenedor del modal.
   * @returns {object} Un objeto con métodos para abrir y cerrar el modal.
   */
  Modal: function(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) {
      console.error(`Modal with id "${modalId}" not found.`);
      return { open: () => {}, close: () => {} };
    }

    const closeBtn = modalEl.querySelector('[id$="Close"]');
    const cancelBtn = modalEl.querySelector('[id$="Cancel"]');

    const open = () => modalEl.classList.remove('hidden');
    const close = () => modalEl.classList.add('hidden');

    if(closeBtn) closeBtn.addEventListener('click', close);
    if(cancelBtn) cancelBtn.addEventListener('click', close);
    
    // Cerrar si se hace clic fuera del modal
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
            close();
        }
    });

    return {
      open,
      close,
      el: modalEl
    };
  }
};
</script>
<div id="loading-spinner" class="hidden"></div>
<div id="toast-container" class="fixed top-5 right-5 z-50 space-y-2"></div>

<!-- Componente: Sidebar -->
<?
  function SidebarLink($view, $label, $svgPath, $currentView) {
    $activeClass = ($view === $currentView) ? 'active' : '';
    $url = ScriptApp.getService().getUrl() + '?view=' + $view;
    return `
      <a href="${url}" class="sidebar-link ${activeClass}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${svgPath}
        </svg>
        <span>${label}</span>
      </a>`;
  }
?>

<aside class="sidebar hidden md:flex">
  <div class="sidebar-header">
    Ventas PRO
  </div>
  <nav class="sidebar-nav">
    <?= SidebarLink('dashboard', 'Dashboard', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />', view) ?>
    <?= SidebarLink('clientes', 'Clientes', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />', view) ?>
    <?= SidebarLink('productos', 'Productos', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />', view) ?>
    <?= SidebarLink('cotizaciones', 'Cotizaciones', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />', view) ?>
    <?= SidebarLink('facturacion', 'Facturación', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />', view) ?>
    <?= SidebarLink('cuentas_por_cobrar', 'Cuentas por Cobrar', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />', view) ?>
    <?= SidebarLink('reportes', 'Reportes', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />', view) ?>
  </nav>
  <div class="mt-auto p-2 border-t border-gray-700">
    <?= SidebarLink('configuracion', 'Configuración', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />', view) ?>
  </div>
</aside>
