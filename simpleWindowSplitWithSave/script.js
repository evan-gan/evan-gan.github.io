document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupContainer = document.getElementById('setup-container');
    const gridContainer = document.getElementById('grid-container');
    const loadGridBtn = document.getElementById('load-grid-btn');
    const backToSetupBtn = document.getElementById('back-to-setup');
    const gridCells = document.querySelectorAll('.grid-cell');
    const resizeDot = document.getElementById('resize-dot');
    
    // Input fields
    const channelNameInput = document.getElementById('channel-name');
    const teamNumberInput = document.getElementById('team-number');
    const nexusEventIdInput = document.getElementById('nexus-event-id');
    
    // URL preview elements
    const url0Preview = document.getElementById('url0-preview');
    const url1Preview = document.getElementById('url1-preview');
    const url2Preview = document.getElementById('url2-preview');
    const url3Preview = document.getElementById('url3-preview');
    
    // Set up center dot resizing
    setupResizableDot();
    
    // Update preview URLs when input changes
    function updatePreviews() {
        const channelName = channelNameInput.value.trim();
        const teamNumber = teamNumberInput.value.trim();
        const nexusEventId = nexusEventIdInput.value.trim();
        const currentHost = window.location.host || 'localhost';
        
        // Update Twitch URL preview
        let twitchUrl = channelName ? 
            `https://player.twitch.tv/?channel=${channelName}&parent=${currentHost}` : 
            'Waiting for channel name...';
        url0Preview.textContent = twitchUrl;
        
        // Update Nexus URL preview
        let nexusUrl = 'https://frc.nexus';
        if (nexusEventId && teamNumber) {
            nexusUrl = `https://frc.nexus/en/event/${nexusEventId}/team/${teamNumber}`;
        } else if (nexusEventId) {
            nexusUrl = `https://frc.nexus/en/event/${nexusEventId}`;
        }
        url1Preview.textContent = nexusUrl;
        
        // Update TBA URL preview
        let tbaUrl = teamNumber ? 
            `https://www.thebluealliance.com/team/${teamNumber}` : 
            'Waiting for team number...';
        url2Preview.textContent = tbaUrl;
        
        // Update Statbotics URL preview
        let statboticsUrl = teamNumber ? 
            `https://www.statbotics.io/team/${teamNumber}` : 
            'Waiting for team number...';
        url3Preview.textContent = statboticsUrl;
    }
    
    // Add input event listeners
    channelNameInput.addEventListener('input', updatePreviews);
    teamNumberInput.addEventListener('input', updatePreviews);
    nexusEventIdInput.addEventListener('input', updatePreviews);
    
    // Initial preview update
    updatePreviews();
    
    // Handle loading the grid with the pre-defined URLs
    loadGridBtn.addEventListener('click', () => {
        const channelName = channelNameInput.value.trim();
        const teamNumber = teamNumberInput.value.trim();
        const nexusEventId = nexusEventIdInput.value.trim();
        const currentHost = window.location.host || 'localhost';
        
        // Define the URLs for each panel
        const urls = [
            channelName ? `https://player.twitch.tv/?channel=${channelName}&parent=${currentHost}` : '',
            nexusEventId && teamNumber ? `https://frc.nexus/en/event/${nexusEventId}/team/${teamNumber}` :
                nexusEventId ? `https://frc.nexus/en/event/${nexusEventId}` : 'https://frc.nexus',
            teamNumber ? `https://www.thebluealliance.com/team/${teamNumber}` : '',
            teamNumber ? `https://www.statbotics.io/team/${teamNumber}` : ''
        ];
        
        // Load URLs into iframes
        gridCells.forEach((cell, index) => {
            const iframe = cell.querySelector('.frame');
            if (urls[index]) {
                iframe.src = urls[index];
            }
        });
        
        // Save input values to URL parameters
        saveInputsToState(channelName, teamNumber, nexusEventId);
        
        // Show grid view
        setupContainer.classList.remove('active');
        gridContainer.classList.remove('hidden');
    });
    
    // Set up the resizable grid with the center dot
    function setupResizableDot() {
        const grid = document.querySelector('.resizable-grid');
        let isResizing = false;
        
        // Initial values (equal sizes)
        let colRatio = 50; // percentage
        let rowRatio = 50; // percentage
        
        // Initialize drag functionality for the center dot
        resizeDot.addEventListener('mousedown', startResize);
        
        function startResize(e) {
            e.preventDefault();
            isResizing = true;
            resizeDot.classList.add('active');
            
            // Add event listeners
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        }
        
        // Use requestAnimationFrame for smoother resizing
        let rafId = null;
        let lastX = 0;
        let lastY = 0;
        
        function handleResize(e) {
            if (!isResizing) return;
            
            // Save current values
            lastX = e.clientX;
            lastY = e.clientY;
            
            // Cancel any existing animation frame
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            
            // Schedule the update with requestAnimationFrame for better performance
            rafId = requestAnimationFrame(updateLayout);
        }
        
        function updateLayout() {
            const gridRect = grid.getBoundingClientRect();
            
            // Calculate column ratio
            const x = lastX - gridRect.left;
            colRatio = (x / gridRect.width) * 100;
            colRatio = Math.max(20, Math.min(80, colRatio)); // Keep within reasonable limits
            
            // Calculate row ratio
            const y = lastY - gridRect.top;
            rowRatio = (y / gridRect.height) * 100;
            rowRatio = Math.max(20, Math.min(80, rowRatio)); // Keep within reasonable limits
            
            // Update grid template directly with calculated values
            grid.style.gridTemplateColumns = `${colRatio}% ${100-colRatio}%`;
            grid.style.gridTemplateRows = `${rowRatio}% ${100-rowRatio}%`;
            
            // Position dot precisely at intersection
            resizeDot.style.left = `${x}px`;
            resizeDot.style.top = `${y}px`;
            
            // Reset animation frame ID
            rafId = null;
        }
        
        function stopResize() {
            if (!isResizing) return;
            
            isResizing = false;
            resizeDot.classList.remove('active');
            
            // Cancel any pending animation frame
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            
            // Remove event listeners
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
            
            // Save the layout if needed
            // localStorage.setItem('gridLayout', JSON.stringify({ colRatio, rowRatio }));
        }
        
        // Load any saved grid layout
        function loadSavedLayout() {
            /* Uncomment to implement saved layouts
            const savedLayout = localStorage.getItem('gridLayout');
            if (savedLayout) {
                try {
                    const { colRatio: savedColRatio, rowRatio: savedRowRatio } = JSON.parse(savedLayout);
                    colRatio = savedColRatio;
                    rowRatio = savedRowRatio;
                    grid.style.gridTemplateColumns = `${colRatio}% ${100-colRatio}%`;
                    grid.style.gridTemplateRows = `${rowRatio}% ${100-rowRatio}%`;
                    
                    // Update the dot position to match the saved layout
                    const dotX = (colRatio / 100) * grid.offsetWidth;
                    const dotY = (rowRatio / 100) * grid.offsetHeight;
                    resizeDot.style.left = `${dotX}px`;
                    resizeDot.style.top = `${dotY}px`;
                    resizeDot.style.transform = 'translate(-50%, -50%)';
                } catch (e) {
                    console.error('Failed to load saved layout', e);
                }
            }
            */
        }
        
        // Initialize with any saved layout
        loadSavedLayout();
    }
    
    // Handle returning to the setup screen
    backToSetupBtn.addEventListener('click', () => {
        setupContainer.classList.add('active');
        gridContainer.classList.add('hidden');
    });
    
    // Try to extract Nexus event ID from a URL
    function extractNexusEventId(url) {
        if (!url) return null;
        
        try {
            const regex = /frc\.nexus\/en\/event\/([^\/]+)/;
            const match = url.match(regex);
            return match ? match[1] : null;
        } catch (e) {
            console.error('Error extracting Nexus event ID:', e);
            return null;
        }
    }
    
    // Save inputs to URL parameters
    function saveInputsToState(channelName, teamNumber, nexusEventId) {
        const urlParams = new URLSearchParams();
        
        if (channelName) {
            urlParams.set('channel', channelName);
        }
        
        if (teamNumber) {
            urlParams.set('team', teamNumber);
        }
        
        if (nexusEventId) {
            urlParams.set('event', nexusEventId);
        }
        
        // Update URL without reloading the page
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState({}, '', newUrl);
    }
    
    // Load inputs from URL parameters
    function loadInputsFromParams() {
        const urlParams = new URLSearchParams(window.location.search);
        let hasParams = false;
        
        const channelParam = urlParams.get('channel');
        if (channelParam) {
            channelNameInput.value = channelParam;
            hasParams = true;
        }
        
        const teamParam = urlParams.get('team');
        if (teamParam) {
            teamNumberInput.value = teamParam;
            hasParams = true;
        }
        
        const eventParam = urlParams.get('event');
        if (eventParam) {
            nexusEventIdInput.value = eventParam;
            hasParams = true;
        }
        
        // Check if this URL has a Nexus event ID in it (maybe from being shared)
        if (!eventParam) {
            const fullUrl = window.location.href;
            const extractedEventId = extractNexusEventId(fullUrl);
            if (extractedEventId) {
                nexusEventIdInput.value = extractedEventId;
                hasParams = true;
            }
        }
        
        // Update previews with loaded values
        updatePreviews();
        
        // If we have URL parameters, automatically load the grid
        if (hasParams && channelNameInput.value && teamNumberInput.value) {
            loadGridBtn.click();
        }
    }
    
    // Initial load from URL parameters
    loadInputsFromParams();
});