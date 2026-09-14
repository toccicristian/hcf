(() => {
  const validPhosphor = /^(green|amber|blue|white)$/;
  let selectedPhosphor = 'green';
  let hasQueryValue = false;

  try {
    const queryValue = new URLSearchParams(location.search).get('phosphor');

    if (validPhosphor.test(queryValue || '')) {
      selectedPhosphor = queryValue;
      hasQueryValue = true;
    }
  } catch (error) {
    // Ignore malformed or unavailable URL state and continue with fallbacks.
  }

  if (!hasQueryValue) {
    const tabValue = (
      (window.name || '').match(
        /^hcf-phosphor:(green|amber|blue|white)$/,
      ) || []
    )[1];

    if (validPhosphor.test(tabValue || '')) {
      selectedPhosphor = tabValue;
    } else {
      try {
        const storedValue = localStorage.getItem('hcf-phosphor');

        if (validPhosphor.test(storedValue || '')) {
          selectedPhosphor = storedValue;
        }
      } catch (error) {
        // localStorage may be unavailable when pages are opened with file://.
      }
    }
  }

  document.documentElement.dataset.phosphor = selectedPhosphor;
  window.__hcfPhosphor = selectedPhosphor;
  window.name = `hcf-phosphor:${selectedPhosphor}`;

  try {
    localStorage.setItem('hcf-phosphor', selectedPhosphor);
  } catch (error) {
    // Keep the selected profile in memory when localStorage is unavailable.
  }
})();
