/**
 * =====================================================
 * GOOGLE TRANSLATE BOOKMARKLET - VERSIÓN COMENTADA
 * =====================================================
 *
 * Versión: 2.7.0
 * Fecha: 17 de noviembre de 2024
 *
 * Este archivo contiene el código COMPLETO con comentarios
 * explicativos para facilitar el estudio y comprensión.
 *
 * Para usar en el navegador, copia el archivo minificado:
 * gtranslate-bookmarklet-minified.js
 */

javascript:(function() {
    'use strict';

    // =====================================================
    // CONSTANTES DE CONFIGURACIÓN
    // =====================================================

    /**
     * Claves para almacenamiento en localStorage
     * Cada clave guarda diferentes tipos de datos
     */
    const STORAGE_KEYS = {
        WORD: 'gtranslateMemoryWord',      // Última palabra buscada
        PARAMS: 'gtranslateMemoryParams',  // Parámetros de última traducción (sl, tl, text)
        HISTORY: 'gtranslateHistory',      // Historial completo de búsquedas (array)
        LAST_DIALOG: 'gtranslateLastDialog' // Timestamp del último diálogo mostrado
    };

    /**
     * Idiomas soportados en la rotación automática
     * DE (Alemán) → EN (Inglés) → ES (Español)
     */
    const LANGUAGES = ['de', 'en', 'es'];

    /**
     * URLs de Google Translate
     */
    const TRANSLATE_BASE_URL = 'https://translate.google.com/';
    const TRANSLATE_DOMAIN = 'translate.google.com';

    // =====================================================
    // FUNCIONES DE GESTIÓN DE IDIOMAS
    // =====================================================

    /**
     * Obtiene el siguiente idioma en la rotación
     * Asegura que el idioma de origen (sourceLang) nunca sea igual al idioma destino
     *
     * @param {string} currentLang - Idioma actual de destino
     * @param {string} sourceLang - Idioma de origen (no puede ser igual al destino)
     * @returns {string} Siguiente idioma en la rotación
     *
     * Ejemplo: Si currentLang='en' y sourceLang='es'
     *          Resultado: 'de' (porque 'es' se salta al ser el sourceLang)
     */
    function getNextLanguage(currentLang, sourceLang) {
        const currentIndex = LANGUAGES.indexOf(currentLang);
        let nextIndex = (currentIndex + 1) % LANGUAGES.length;
        let nextLang = LANGUAGES[nextIndex];

        // Si el siguiente idioma es el mismo que el de origen, saltar al siguiente
        if (nextLang === sourceLang) {
            nextIndex = (nextIndex + 1) % LANGUAGES.length;
            nextLang = LANGUAGES[nextIndex];
        }

        return nextLang;
    }

    // =====================================================
    // FUNCIONES DE ALMACENAMIENTO (localStorage)
    // =====================================================

    /**
     * Recupera los parámetros guardados de la última traducción
     *
     * @returns {Object} Objeto con sl (source lang), tl (target lang), text
     */
    function getSavedParams() {
        const saved = localStorage.getItem(STORAGE_KEYS.PARAMS);
        if (!saved) {
            // Valores por defecto: DE → EN
            return { sl: 'de', tl: 'en', text: '' };
        }
        return JSON.parse(saved);
    }

    /**
     * Guarda los parámetros de la traducción actual
     *
     * @param {string} sl - Source language (idioma origen)
     * @param {string} tl - Target language (idioma destino)
     * @param {string} text - Texto a traducir
     */
    function saveParams(sl, tl, text) {
        const params = { sl, tl, text };
        localStorage.setItem(STORAGE_KEYS.PARAMS, JSON.stringify(params));
        localStorage.setItem(STORAGE_KEYS.WORD, text);
    }

    /**
     * Obtiene el historial completo de traducciones
     *
     * @returns {Array} Array de objetos con {word, sl, tl, timestamp}
     */
    function getHistory() {
        const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
        return history ? JSON.parse(history) : [];
    }

    /**
     * Agrega una nueva entrada al historial
     * Previene duplicados CONSECUTIVOS (misma palabra + idiomas)
     *
     * @param {string} word - Palabra a guardar
     * @param {string} sl - Idioma origen
     * @param {string} tl - Idioma destino
     */
    function addToHistory(word, sl, tl) {
        if (!word || word.trim() === '') return;

        const history = getHistory();
        const entry = {
            word: word.trim(),
            sl: sl,
            tl: tl,
            timestamp: new Date().toISOString()
        };

        // Prevenir duplicados consecutivos
        if (history.length > 0) {
            const lastEntry = history[history.length - 1];
            if (lastEntry.word === entry.word &&
                lastEntry.sl === entry.sl &&
                lastEntry.tl === entry.tl) {
                return; // No agregar si es igual al último
            }
        }

        history.push(entry);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }

    // =====================================================
    // FUNCIONES DE CONSTRUCCIÓN DE URLs
    // =====================================================

    /**
     * Construye la URL completa de Google Translate
     *
     * @param {string} sl - Source language
     * @param {string} tl - Target language
     * @param {string} text - Texto a traducir
     * @returns {string} URL completa de Google Translate
     */
    function buildTranslateURL(sl, tl, text) {
        const params = new URLSearchParams({
            sl: sl,
            tl: tl,
            text: text,
            op: 'translate'
        });
        return TRANSLATE_BASE_URL + '?' + params.toString();
    }

    // =====================================================
    // FUNCIONES DE NAVEGACIÓN
    // =====================================================

    /**
     * Verifica si ya estamos en Google Translate
     *
     * @returns {boolean} true si estamos en translate.google.com
     */
    function isOnGoogleTranslate() {
        return window.location.hostname.includes(TRANSLATE_DOMAIN);
    }

    /**
     * Navega a la URL de traducción
     * Si ya estamos en GT, usa location.href (misma pestaña)
     * Si no, abre en nueva pestaña
     *
     * @param {string} url - URL destino
     */
    function navigateToURL(url) {
        if (isOnGoogleTranslate()) {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
    }

    // =====================================================
    // GESTIÓN DE DIÁLOGOS
    // =====================================================

    /**
     * Determina si debe mostrarse el diálogo inicial
     * Reglas:
     * - Siempre si no hay historial
     * - Siempre si nunca se mostró
     * - Una vez al día (no más veces el mismo día)
     *
     * @returns {boolean} true si debe mostrarse el diálogo
     */
    function shouldShowDialog() {
        const history = getHistory();
        if (history.length === 0) {
            return true; // Primera vez
        }

        const lastDialog = localStorage.getItem(STORAGE_KEYS.LAST_DIALOG);
        if (!lastDialog) {
            return true; // Nunca se mostró
        }

        // Verificar si es un día diferente
        const lastDate = new Date(lastDialog);
        const today = new Date();

        if (lastDate.getFullYear() !== today.getFullYear() ||
            lastDate.getMonth() !== today.getMonth() ||
            lastDate.getDate() !== today.getDate()) {
            return true; // Es otro día
        }

        return false; // Ya se mostró hoy
    }

    /**
     * Marca que el diálogo fue mostrado (guarda timestamp actual)
     */
    function markDialogShown() {
        localStorage.setItem(STORAGE_KEYS.LAST_DIALOG, new Date().toISOString());
    }

    // =====================================================
    // FUNCIÓN PRINCIPAL DE TRADUCCIÓN
    // =====================================================

    /**
     * Maneja el flujo completo de traducción
     * 1. Muestra prompt para ingresar palabra
     * 2. Detecta comandos especiales (?, historial, vacío)
     * 3. Rota idiomas si es la misma palabra
     * 4. Guarda en historial
     * 5. Navega a Google Translate
     */
    function performTranslation() {
        const savedParams = getSavedParams();
        const lastWord = localStorage.getItem(STORAGE_KEYS.WORD) || '';

        // Mostrar prompt al usuario
        const userInput = prompt(
            'Palabra a traducir:\n(Vacío, "historial" o "?" para ver historial)',
            lastWord
        );

        if (userInput === null) return; // Usuario canceló

        const trimmedInput = userInput.trim().toLowerCase();

        // Detectar comandos especiales para ver historial
        if (trimmedInput === '' || trimmedInput === 'historial' || trimmedInput === '?') {
            showHistory();
            return;
        }

        const originalInput = userInput.trim();
        const wordChanged = originalInput !== lastWord;

        let sl = savedParams.sl;
        let tl = savedParams.tl;

        // Si es la misma palabra, rotar idioma destino
        if (!wordChanged) {
            tl = getNextLanguage(tl, sl);
        }

        saveParams(sl, tl, originalInput);
        addToHistory(originalInput, sl, tl);

        const url = buildTranslateURL(sl, tl, originalInput);
        navigateToURL(url);
    }

    // =====================================================
    // GENERACIÓN DE HISTORIAL (HTML + AGRUPACIÓN)
    // =====================================================

    /**
     * Agrupa el historial por palabra+idiomas y cuenta repeticiones
     *
     * @param {Array} history - Historial completo
     * @returns {Array} Array de objetos agrupados con contador
     */
    function groupHistory(history) {
        const grouped = {};

        history.forEach(item => {
            // Clave única: palabra + idiomas
            const key = `${item.word}|${item.sl}|${item.tl}`;

            if (!grouped[key]) {
                grouped[key] = {
                    word: item.word,
                    sl: item.sl,
                    tl: item.tl,
                    count: 0,
                    firstDate: item.timestamp,
                    lastDate: item.timestamp
                };
            }

            grouped[key].count++;

            // Actualizar última fecha si es más reciente
            if (new Date(item.timestamp) > new Date(grouped[key].lastDate)) {
                grouped[key].lastDate = item.timestamp;
            }
        });

        // Convertir objeto a array
        return Object.values(grouped);
    }

    /**
     * Genera el HTML inicial para mostrar el historial
     * Esta función se ejecuta ANTES de abrir la ventana
     *
     * @param {Array} history - Historial completo
     * @returns {string} HTML como string
     */
    function generateHistoryItemsHTML(history) {
        if (history.length === 0) {
            return '<div class="empty-state">' +
                   '<svg viewBox="0 0 24 24" fill="currentColor">' +
                   '<path d="M9 2C7.89 2 7 2.9 7 4V20C7 21.1 7.89 22 9 22H18C19.1 22 20 21.1 20 20V8L14 2H9M13 3.5L18.5 9H13V3.5M10 19V17H17V19H10M10 15V13H17V15H10M10 11V9H17V11H10Z"/>' +
                   '</svg>' +
                   '<h3>No hay historial aún</h3>' +
                   '<p>Las palabras que busques aparecerán aquí</p>' +
                   '</div>';
        }

        // Agrupar historial
        const groupedHistory = groupHistory(history);

        let html = '';
        for (let i = 0; i < groupedHistory.length; i++) {
            const item = groupedHistory[i];
            const date = new Date(item.lastDate);
            const formattedDate = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const url = buildTranslateURL(item.sl, item.tl, item.word);

            // Escapar HTML manualmente
            const escapedWord = item.word
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

            // Badge de contador si es mayor a 1
            const countBadge = item.count > 1
                ? `<span class="count-badge">×${item.count}</span>`
                : '';

            html += '<div class="history-item">' +
                    '<a href="' + url + '" target="_blank">' +
                    '<div>' +
                    '<div class="word">' + escapedWord + countBadge + '</div>' +
                    '<div class="meta">' +
                    '<span class="lang-badge">' + item.sl.toUpperCase() + '</span>' +
                    '<span class="lang-badge">' + item.tl.toUpperCase() + '</span>' +
                    '<span>' + formattedDate + '</span>' +
                    '</div>' +
                    '</div>' +
                    '<span>→</span>' +
                    '</a>' +
                    '</div>';
        }

        return html;
    }

    // =====================================================
    // MOSTRAR VENTANA DE HISTORIAL
    // =====================================================

    /**
     * Crea y muestra la ventana con el historial completo
     * Usa Blob URLs para evitar problemas de CSP
     * Inyecta JavaScript dinámicamente desde la ventana padre
     */
    function showHistory() {
        const history = getHistory();
        const groupedHistory = groupHistory(history);
        const historyItemsHTML = generateHistoryItemsHTML(history);

        // HTML completo (sin <script> tags para evitar CSP)
        const htmlContent = '<!DOCTYPE html>' +
            '<html lang="es">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<title>Historial de Google Translate</title>' +
            '<style>' +
            '* { margin: 0; padding: 0; box-sizing: border-box; }' +
            'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }' +
            '.container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; }' +
            '.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }' +
            '.header h1 { font-size: 28px; margin-bottom: 10px; }' +
            '.header p { opacity: 0.9; font-size: 14px; }' +
            '.controls { padding: 20px 30px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; display: flex; flex-wrap: wrap; gap: 10px; }' +
            '.btn { padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all 0.3s; font-weight: 500; }' +
            '.btn-primary { background: #667eea; color: white; }' +
            '.btn-primary:hover { background: #5568d3; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }' +
            '.btn-success { background: #28a745; color: white; }' +
            '.btn-success:hover { background: #218838; transform: translateY(-2px); }' +
            '.btn-warning { background: #ffc107; color: #212529; }' +
            '.btn-warning:hover { background: #e0a800; transform: translateY(-2px); }' +
            '.btn-danger { background: #dc3545; color: white; }' +
            '.btn-danger:hover { background: #c82333; transform: translateY(-2px); }' +
            '.stats { padding: 15px 30px; background: #e3f2fd; border-bottom: 1px solid #bbdefb; font-size: 14px; color: #1976d2; font-weight: 500; }' +
            '.history-list { padding: 20px 30px; max-height: 600px; overflow-y: auto; }' +
            '.history-item { padding: 15px; margin-bottom: 10px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; transition: all 0.3s; }' +
            '.history-item:hover { background: #e9ecef; transform: translateX(5px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }' +
            '.history-item a { text-decoration: none; color: #212529; display: flex; justify-content: space-between; align-items: center; }' +
            '.word { font-size: 18px; font-weight: 600; color: #667eea; }' +
            '.meta { font-size: 12px; color: #6c757d; margin-top: 5px; }' +
            '.lang-badge { display: inline-block; padding: 2px 8px; background: #667eea; color: white; border-radius: 4px; font-size: 11px; margin-right: 5px; }' +
            '.count-badge { display: inline-block; padding: 2px 8px; background: #ff6b6b; color: white; border-radius: 4px; font-size: 11px; margin-left: 8px; font-weight: bold; }' +
            '.empty-state { text-align: center; padding: 60px 20px; color: #6c757d; }' +
            '.empty-state svg { width: 100px; height: 100px; margin-bottom: 20px; opacity: 0.3; }' +
            'input[type="file"] { display: none; }' +
            '@media (max-width: 600px) { .controls { flex-direction: column; } .btn { width: 100%; } }' +
            '</style>' +
            '</head>' +
            '<body>' +
            '<div class="container">' +
            '<div class="header">' +
            '<h1>📚 Historial de Traducciones</h1>' +
            '<p>Todas tus búsquedas en Google Translate</p>' +
            '</div>' +
            '<div class="controls">' +
            '<button class="btn btn-primary" id="btnSortDate">🕐 Por Fecha</button>' +
            '<button class="btn btn-primary" id="btnSortAlpha">🔤 A-Z</button>' +
            '<button class="btn btn-primary" id="btnSortCount">🔢 Por Uso</button>' +
            '<button class="btn btn-success" id="btnExport">💾 Exportar</button>' +
            '<button class="btn btn-warning" id="btnImport">📥 Importar</button>' +
            '<input type="file" id="importFile" accept=".json">' +
            '<button class="btn btn-danger" id="btnClear">🗑️ Borrar</button>' +
            '</div>' +
            '<div class="stats">Palabras únicas: <strong id="totalCount">' + groupedHistory.length + '</strong></div>' +
            '<div class="history-list" id="historyList">' + historyItemsHTML + '</div>' +
            '</div>' +
            '</body>' +
            '</html>';

        // Intentar abrir con Blob URL (método preferido)
        try {
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const blobURL = URL.createObjectURL(blob);
            const newWindow = window.open(blobURL, '_blank');

            if (newWindow) {
                // Esperar a que el DOM esté listo y luego inyectar scripts
                setTimeout(function() {
                    injectScripts(newWindow, history, groupedHistory);
                }, 200); // Aumentado a 200ms para mayor confiabilidad
            } else {
                // Fallback: Data URI
                fallbackToDataURI(htmlContent, history, groupedHistory);
            }
        } catch (error) {
            // Fallback en caso de error
            fallbackToDataURI(htmlContent, history, groupedHistory);
        }
    }

    /**
     * Fallback: Usar Data URI si Blob URL falla
     */
    function fallbackToDataURI(htmlContent, history, groupedHistory) {
        try {
            const dataURI = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
            const dataWindow = window.open(dataURI, '_blank');

            if (dataWindow) {
                setTimeout(function() {
                    injectScripts(dataWindow, history, groupedHistory);
                }, 200);
            } else {
                alert('No se pudo abrir el historial. Por favor, permite ventanas emergentes.');
            }
        } catch (e) {
            alert('Error al abrir el historial: ' + e.message);
        }
    }

    // =====================================================
    // INYECCIÓN DINÁMICA DE JAVASCRIPT
    // =====================================================

    /**
     * Inyecta todas las funciones JavaScript en la ventana del historial
     * Esto evita problemas de CSP al no tener <script> tags inline
     *
     * @param {Window} win - Ventana del historial
     * @param {Array} history - Historial completo (sin agrupar)
     * @param {Array} groupedHistory - Historial agrupado con contadores
     */
    function injectScripts(win, history, groupedHistory) {
        if (!win || win.closed) return;

        try {
            // ===== DATOS =====
            win.rawHistory = JSON.parse(JSON.stringify(history));
            win.groupedHistory = JSON.parse(JSON.stringify(groupedHistory));
            win.currentView = 'date'; // 'date', 'alpha', 'count'

            // ===== FUNCIONES AUXILIARES DE STORAGE =====

            win.getLocalStorage = function(key) {
                try {
                    if (window.opener && !window.opener.closed) {
                        return window.opener.localStorage.getItem(key);
                    }
                    return localStorage.getItem(key);
                } catch (e) {
                    return localStorage.getItem(key);
                }
            };

            win.setLocalStorage = function(key, value) {
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.localStorage.setItem(key, value);
                    }
                    localStorage.setItem(key, value);
                } catch (e) {
                    localStorage.setItem(key, value);
                }
            };

            win.removeLocalStorage = function(key) {
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.localStorage.removeItem(key);
                    }
                    localStorage.removeItem(key);
                } catch (e) {
                    localStorage.removeItem(key);
                }
            };

            // ===== FUNCIÓN DE ESCAPE HTML =====

            win.escapeHtml = function(text) {
                var div = win.document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };

            // ===== FUNCIÓN DE AGRUPACIÓN =====

            win.groupHistory = function(historyArray) {
                var grouped = {};

                for (var i = 0; i < historyArray.length; i++) {
                    var item = historyArray[i];
                    var key = item.word + '|' + item.sl + '|' + item.tl;

                    if (!grouped[key]) {
                        grouped[key] = {
                            word: item.word,
                            sl: item.sl,
                            tl: item.tl,
                            count: 0,
                            firstDate: item.timestamp,
                            lastDate: item.timestamp
                        };
                    }

                    grouped[key].count++;

                    if (new Date(item.timestamp) > new Date(grouped[key].lastDate)) {
                        grouped[key].lastDate = item.timestamp;
                    }
                }

                return Object.keys(grouped).map(function(key) {
                    return grouped[key];
                });
            };

            // ===== GENERAR HTML DEL HISTORIAL =====

            win.generateHistoryHTML = function(data) {
                if (data.length === 0) {
                    return '<div class="empty-state">' +
                           '<svg viewBox="0 0 24 24" fill="currentColor">' +
                           '<path d="M9 2C7.89 2 7 2.9 7 4V20C7 21.1 7.89 22 9 22H18C19.1 22 20 21.1 20 20V8L14 2H9M13 3.5L18.5 9H13V3.5M10 19V17H17V19H10M10 15V13H17V15H10M10 11V9H17V11H10Z"/>' +
                           '</svg>' +
                           '<h3>No hay historial aún</h3>' +
                           '<p>Las palabras que busques aparecerán aquí</p>' +
                           '</div>';
                }

                var html = '';
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var date = new Date(item.lastDate);
                    var formattedDate = date.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    var url = 'https://translate.google.com/?sl=' + item.sl +
                              '&tl=' + item.tl +
                              '&text=' + encodeURIComponent(item.word) +
                              '&op=translate';

                    var escapedWord = win.escapeHtml(item.word);
                    var countBadge = item.count > 1
                        ? '<span class="count-badge">×' + item.count + '</span>'
                        : '';

                    html += '<div class="history-item">' +
                            '<a href="' + url + '" target="_blank">' +
                            '<div>' +
                            '<div class="word">' + escapedWord + countBadge + '</div>' +
                            '<div class="meta">' +
                            '<span class="lang-badge">' + item.sl.toUpperCase() + '</span>' +
                            '<span class="lang-badge">' + item.tl.toUpperCase() + '</span>' +
                            '<span>' + formattedDate + '</span>' +
                            '</div>' +
                            '</div>' +
                            '<span>→</span>' +
                            '</a>' +
                            '</div>';
                }

                return html;
            };

            // ===== ACTUALIZAR DISPLAY =====

            win.updateDisplay = function() {
                var list = win.document.getElementById('historyList');
                var counter = win.document.getElementById('totalCount');

                if (list) {
                    list.innerHTML = win.generateHistoryHTML(win.groupedHistory);
                }
                if (counter) {
                    counter.textContent = win.groupedHistory.length;
                }
            };

            // ===== FUNCIONES DE ORDENAMIENTO =====

            win.sortByDate = function() {
                win.groupedHistory.sort(function(a, b) {
                    return new Date(b.lastDate) - new Date(a.lastDate);
                });
                win.currentView = 'date';
                win.updateDisplay();
            };

            win.sortAlphabetically = function() {
                win.groupedHistory.sort(function(a, b) {
                    return a.word.localeCompare(b.word);
                });
                win.currentView = 'alpha';
                win.updateDisplay();
            };

            win.sortByCount = function() {
                win.groupedHistory.sort(function(a, b) {
                    if (b.count !== a.count) {
                        return b.count - a.count; // Ordenar por count descendente
                    }
                    return new Date(b.lastDate) - new Date(a.lastDate); // Si son iguales, por fecha
                });
                win.currentView = 'count';
                win.updateDisplay();
            };

            // ===== LIMPIAR HISTORIAL =====

            win.clearHistory = function() {
                if (win.confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
                    win.removeLocalStorage('gtranslateHistory');
                    win.rawHistory = [];
                    win.groupedHistory = [];
                    win.updateDisplay();
                    win.alert('✅ Historial borrado correctamente');
                }
            };

            // ===== EXPORTAR HISTORIAL =====

            win.exportHistory = function() {
                var dataStr = JSON.stringify(win.rawHistory, null, 2);
                var blob = new win.Blob([dataStr], { type: 'application/json' });
                var url = win.URL.createObjectURL(blob);
                var a = win.document.createElement('a');
                a.href = url;
                a.download = 'gtranslate-history-' + new Date().toISOString().split('T')[0] + '.json';
                win.document.body.appendChild(a);
                a.click();
                win.document.body.removeChild(a);
                win.URL.revokeObjectURL(url);
            };

            // ===== IMPORTAR HISTORIAL =====

            win.importHistory = function(event) {
                var file = event.target.files[0];
                if (!file) return;

                var reader = new win.FileReader();
                reader.onload = function(e) {
                    try {
                        var importedData = JSON.parse(e.target.result);
                        if (!Array.isArray(importedData)) {
                            win.alert('Formato de archivo inválido');
                            return;
                        }

                        var combined = win.rawHistory.concat(importedData);

                        // Eliminar duplicados por timestamp
                        var unique = combined.filter(function(item, index, self) {
                            return index === self.findIndex(function(t) {
                                return t.word === item.word &&
                                       t.sl === item.sl &&
                                       t.tl === item.tl &&
                                       t.timestamp === item.timestamp;
                            });
                        });

                        unique.sort(function(a, b) {
                            return new Date(a.timestamp) - new Date(b.timestamp);
                        });

                        win.setLocalStorage('gtranslateHistory', JSON.stringify(unique));
                        win.rawHistory = unique;
                        win.groupedHistory = win.groupHistory(unique);

                        // Aplicar vista actual
                        if (win.currentView === 'alpha') {
                            win.sortAlphabetically();
                        } else if (win.currentView === 'count') {
                            win.sortByCount();
                        } else {
                            win.sortByDate();
                        }

                        win.alert('✅ Importación exitosa: ' + importedData.length + ' entradas');
                    } catch (error) {
                        win.alert('Error al importar: ' + error.message);
                    }
                };

                reader.readAsText(file);
                event.target.value = ''; // Limpiar input
            };

            // ===== AGREGAR EVENT LISTENERS =====

            var btnSortDate = win.document.getElementById('btnSortDate');
            var btnSortAlpha = win.document.getElementById('btnSortAlpha');
            var btnSortCount = win.document.getElementById('btnSortCount');
            var btnExport = win.document.getElementById('btnExport');
            var btnImport = win.document.getElementById('btnImport');
            var importFile = win.document.getElementById('importFile');
            var btnClear = win.document.getElementById('btnClear');

            // IMPORTANTE: Usar funciones anónimas para asegurar que las funciones
            // se ejecuten en el contexto correcto del window hijo
            if (btnSortDate) {
                btnSortDate.addEventListener('click', function() { win.sortByDate(); });
            }
            if (btnSortAlpha) {
                btnSortAlpha.addEventListener('click', function() { win.sortAlphabetically(); });
            }
            if (btnSortCount) {
                btnSortCount.addEventListener('click', function() { win.sortByCount(); });
            }
            if (btnExport) {
                btnExport.addEventListener('click', function() { win.exportHistory(); });
            }
            if (btnImport) {
                btnImport.addEventListener('click', function() {
                    if (importFile) {
                        importFile.click();
                    }
                });
            }
            if (importFile) {
                importFile.addEventListener('change', win.importHistory);
            }
            if (btnClear) {
                btnClear.addEventListener('click', function() { win.clearHistory(); });
            }

            // Ordenar por fecha al cargar
            win.sortByDate();

        } catch (e) {
            if (win.console) {
                win.console.error('Error inyectando scripts:', e);
            }
        }
    }

    // =====================================================
    // FUNCIÓN INICIAL (ENTRY POINT)
    // =====================================================

    /**
     * Punto de entrada del bookmarklet
     * Decide si mostrar el diálogo o ir directo a traducción
     */
    function showInitialDialog() {
        if (shouldShowDialog()) {
            markDialogShown();
            const choice = confirm(
                '🌐 Google Translate Avanzado\n\n' +
                '✅ Aceptar = Continuar flujo normal\n' +
                '❌ Cancelar = Ver historial'
            );

            if (choice) {
                performTranslation();
            } else {
                showHistory();
            }
        } else {
            performTranslation();
        }
    }

    // =====================================================
    // EJECUTAR AL CARGAR
    // =====================================================

    showInitialDialog();

})();
