// Mock simplified version of the logic
let loading = true;
let data = null;

function useCachedQuery(user) {
    console.log("Render with user:", user !== null);
    
    // Simulating useEffect
    if (!user) {
        console.log("User is null, returning early");
        return { data, loading };
    }
    
    // Simulate cache hit
    const cached = null; // Let's say cache is empty or expired
    if (cached) {
        data = cached;
        loading = false;
    }
    
    // Simulate refresh trigger
    console.log("Triggering refresh...");
    setTimeout(() => {
        data = "real data";
        loading = false; // FINALLY
        console.log("Refresh done, loading = false");
    }, 100);
    
    return { data, loading };
}

useCachedQuery({ id: 1 });
setTimeout(() => useCachedQuery(null), 10);
setTimeout(() => useCachedQuery({ id: 1 }), 150);
