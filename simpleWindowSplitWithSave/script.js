document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const grid = document.querySelector('.grid');
    const cells = document.querySelectorAll('.cell');
    const vResizer = document.getElementById('v-resize');
    const hResizer = document.getElementById('h-resize');
    const intersectionResizer = document.querySelector('.intersection-resizer');
    
    // Set up URL loading for each cell
    cells.forEach((cell, index) => {
        const input = cell.querySelector('.url-input');
        const loadBtn = cell.querySelector('.load-url-btn');
        const iframe = cell.querySelector('.frame');
        const inputContainer = cell.querySelector('.url-input-container');
        
        // Add reload button (initially hidden)
        const reloadBtn = document.createElement('button');
        reloadBtn.textContent = 'Edit URL';
        reloadBtn.className = 'reload-btn';
        reloadBtn.style.display = 'none';
        reloadBtn.addEventListener('click', () => {
            iframe.classList.add('hidden');
            inputContainer.style.display = 'flex';
            input.value = iframe.src;
        });
        cell.appendChild(reloadBtn);

        loadBtn.addEventListener('click', () => {
            loadURL(input, iframe, inputContainer, reloadBtn);
            saveURLsToState();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                loadURL(input, iframe, inputContainer, reloadBtn);
                saveURLsToState();
            }
        });
    });

    // Handle resizing functionality
    let isResizing = false;
    let currentResizer = null;
    
    function initResizer(resizer, isHorizontal) {
        if (!resizer) return;
        
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            currentResizer = {
                element: resizer,
                horizontal: isHorizontal
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResizing);
        });
    }

    // Initialize resizers
    initResizer(vResizer, false); // vertical resizer
    initResizer(hResizer, true);  // horizontal resizer
    
    // Handle the intersection resizer (can move both horizontally and vertically)
    if (intersectionResizer) {
        intersectionResizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            currentResizer = {
                element: intersectionResizer,
                isBoth: true
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResizing);
        });
    }

    function handleMouseMove(e) {
        if (!isResizing) return;
        
        const rect = grid.getBoundingClientRect();
        
        // Special handling for the intersection resizer
        if (currentResizer.isBoth) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const totalWidth = rect.width;
            const totalHeight = rect.height;
            
            // Update both column and row sizes
            if (x > 50 && x < totalWidth - 50) {
                const xPercentage = (x / totalWidth) * 100;
                grid.style.gridTemplateColumns = `${xPercentage}% 10px 1fr`;
            }
            
            if (y > 50 && y < totalHeight - 50) {
                const yPercentage = (y / totalHeight) * 100;
                grid.style.gridTemplateRows = `${yPercentage}% 10px 1fr`;
            }
            return;
        }
        
        // Handle horizontal and vertical resizers
        if (currentResizer.horizontal) {
            const y = e.clientY - rect.top;
            const totalHeight = rect.height;
            if (y > 50 && y < totalHeight - 50) {
                const percentage = (y / totalHeight) * 100;
                grid.style.gridTemplateRows = `${percentage}% 10px 1fr`;
            }
        } else {
            const x = e.clientX - rect.left;
            const totalWidth = rect.width;
            if (x > 50 && x < totalWidth - 50) {
                const percentage = (x / totalWidth) * 100;
                grid.style.gridTemplateColumns = `${percentage}% 10px 1fr`;
            }
        }
    }

    function stopResizing() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    }

    // URL loading function
    function loadURL(input, iframe, inputContainer, reloadBtn) {
        let url = input.value.trim();
        
        // Add https:// if no protocol is specified
        if (url && !url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
            input.value = url;
        }
        
        if (url) {
            iframe.src = url;
            iframe.classList.remove('hidden');
            inputContainer.style.display = 'none';
            reloadBtn.style.display = 'block';
        }
    }

    // Save URLs to URL parameter
    function saveURLsToState() {
        const urls = [];
        cells.forEach((cell, index) => {
            const iframe = cell.querySelector('.frame');
            urls.push(iframe.src || '');
        });
        
        // Filter out empty URLs
        const nonEmptyUrls = urls.filter(url => url !== '');
        
        // Only update URL if we have at least one non-empty URL
        if (nonEmptyUrls.length > 0) {
            const urlParams = new URLSearchParams();
            urls.forEach((url, index) => {
                if (url) {
                    urlParams.set(`url${index}`, url);
                }
            });
            
            // Update URL without reloading the page
            const newUrl = window.location.pathname + '?' + urlParams.toString();
            window.history.replaceState({}, '', newUrl);
        }
    }

    // Load URLs from URL parameters
    function loadURLsFromParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        cells.forEach((cell, index) => {
            const urlParam = urlParams.get(`url${index}`);
            if (urlParam) {
                const input = cell.querySelector('.url-input');
                const iframe = cell.querySelector('.frame');
                const inputContainer = cell.querySelector('.url-input-container');
                const reloadBtn = cell.querySelector('.reload-btn');
                
                input.value = urlParam;
                iframe.src = urlParam;
                iframe.classList.remove('hidden');
                inputContainer.style.display = 'none';
                reloadBtn.style.display = 'block';
            }
        });
    }

    // Initial load from URL parameters
    loadURLsFromParams();
});