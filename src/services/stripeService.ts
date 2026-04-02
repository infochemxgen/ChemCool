
export const createCheckoutSession = async (priceId: string, userId: string, userEmail: string, tier: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        tier
      }),
    });

    let data: any;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', text);
      throw new Error(`Server returned an invalid response (${response.status}). Please check server logs.`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Server error (${response.status}): ${text.substring(0, 100)}`);
    }

    const { sessionId, url } = data;
    
    console.log('Checkout session created:', { sessionId, hasUrl: !!url });

    if (url) {
      console.log('Redirecting to Stripe Checkout URL...');
      
      // Stripe Checkout CANNOT be rendered in an iframe.
      // We must escape the iframe to the top-level window.
      
      try {
        // Check if we are in an iframe
        const isIframe = window.self !== window.top;
        
        if (isIframe) {
          console.log('Detected iframe environment, attempting to redirect top window...');
          // This might fail due to cross-origin restrictions if the top window is not on the same domain
          // but for AI Studio preview, we usually want to try this.
          try {
            window.top!.location.href = url;
          } catch (topError) {
            console.warn('Top-level redirect failed, falling back to window.open:', topError);
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
              // If popup blocked, try current window as last resort (might show error in iframe)
              window.location.href = url;
            }
          }
        } else {
          window.location.href = url;
        }
      } catch (e) {
        console.error('Redirect failed:', e);
        // Fallback: Open in a new tab
        window.open(url, '_blank') || (window.location.href = url);
      }
    } else {
      throw new Error('No checkout URL received from server.');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
