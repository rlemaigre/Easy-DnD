// Forked from https://github.com/bennadel/JavaScript-Demos/blob/master/demos/window-edge-scrolling/index.htm
// Code was altered to work with scrollable containers

var timer = null;

export function cancelScrollAction () {
  clearTimeout(timer);
}

export function performEdgeScroll (event, container, clientX, clientY, edgeSize) {
  if (!container || !edgeSize) {
    cancelScrollAction();
    return false;
  }
  
  // NOTE: Much of the information here, with regard to document dimensions,
  // viewport dimensions, and window scrolling is derived from JavaScript.info.
  // I am consuming it here primarily as NOTE TO SELF.
  // --
  // Read More: https://javascript.info/size-and-scroll-window
  // --
  // CAUTION: The viewport and document dimensions can all be CACHED and then
  // recalculated on window-resize events (for the most part). I am keeping it
  // all here in the mousemove event handler to remove as many of the moving
  // parts as possible and keep the demo as simple as possible.
  
  // Get the viewport-relative coordinates of the mousemove event.
  var rect = container.getBoundingClientRect();
  var isBody = container === document.body;
  
  var viewportX = clientX - rect.left;
  var viewportY = clientY - rect.top;
  if (isBody) {
    viewportX = clientX;
    viewportY = clientY;
  }
  
  // Get the viewport dimensions.
  var viewportWidth = rect.width;
  var viewportHeight = rect.height;
  if (isBody) {
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = document.documentElement.clientHeight;
  }
  
  // Next, we need to determine if the mouse is within the "edge" of the
  // viewport, which may require scrolling the window. To do this, we need to
  // calculate the boundaries of the edge in the viewport (these coordinates
  // are relative to the viewport grid system).
  var edgeTop = edgeSize;
  var edgeLeft = edgeSize;
  var edgeBottom = ( viewportHeight - edgeSize );
  var edgeRight = ( viewportWidth - edgeSize );
  
  var isInLeftEdge = ( viewportX < edgeLeft );
  var isInRightEdge = ( viewportX > edgeRight );
  var isInTopEdge = ( viewportY < edgeTop );
  var isInBottomEdge = ( viewportY > edgeBottom );
  
  // If the mouse is not in the viewport edge, there's no need to calculate
  // anything else.
  if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
    cancelScrollAction();
    return false;
  }
  
  // If we made it this far, the user's mouse is located within the edge of the
  // viewport. As such, we need to check to see if scrolling needs to be done.
  
  // Get the document dimensions.
  var documentWidth = Math.max(
    container.scrollWidth,
    container.offsetWidth,
    container.clientWidth
  );
  var documentHeight = Math.max(
    container.scrollHeight,
    container.offsetHeight,
    container.clientHeight
  );
  
  // Calculate the maximum scroll offset in each direction. Since you can only
  // scroll the overflow portion of the document, the maximum represents the
  // length of the document that is NOT in the viewport.
  var maxScrollX = (documentWidth - viewportWidth);
  var maxScrollY = (documentHeight - viewportHeight);
  
  // As we examine the mousemove event, we want to adjust the window scroll in
  // immediate response to the event; but, we also want to continue adjusting
  // the window scroll if the user rests their mouse in the edge boundary. To
  // do this, we'll invoke the adjustment logic immediately. Then, we'll setup
  // a timer that continues to invoke the adjustment logic while the window can
  // still be scrolled in a particular direction.
  (function checkForWindowScroll () {
    cancelScrollAction();
    
    if (adjustWindowScroll()) {
      timer = setTimeout( checkForWindowScroll, 30 );
    }
  })();
  
  // Adjust the window scroll based on the user's mouse position. Returns True
  // or False depending on whether or not the window scroll was changed.
  function adjustWindowScroll () {
    // Get the current scroll position of the document.
    var currentScrollX = container.scrollLeft;
    var currentScrollY = container.scrollTop;
    if (isBody) {
      currentScrollX = window.pageXOffset;
      currentScrollY = window.pageYOffset;
    }
    
    // Determine if the window can be scrolled in any particular direction.
    var canScrollUp = (currentScrollY > 0);
    var canScrollDown = (currentScrollY < maxScrollY);
    var canScrollLeft = (currentScrollX > 0);
    var canScrollRight = (currentScrollX < maxScrollX);
    
    // Since we can potentially scroll in two directions at the same time,
    // let's keep track of the next scroll, starting with the current scroll.
    // Each of these values can then be adjusted independently in the logic
    // below.
    var nextScrollX = currentScrollX;
    var nextScrollY = currentScrollY;
    
    // As we examine the mouse position within the edge, we want to make the
    // incremental scroll changes more "intense" the closer that the user
    // gets the viewport edge. As such, we'll calculate the percentage that
    // the user has made it "through the edge" when calculating the delta.
    // Then, that use that percentage to back-off from the "max" step value.
    var maxStep = 50;
    
    // Should we scroll left?
    if (isInLeftEdge && canScrollLeft) {
      const intensity = ((edgeLeft - viewportX) / edgeSize);
      nextScrollX = (nextScrollX - (maxStep * intensity));
    }
    // Should we scroll right?
    else if (isInRightEdge && canScrollRight) {
      const intensity = ((viewportX - edgeRight) / edgeSize);
      nextScrollX = (nextScrollX + (maxStep * intensity));
    }
    
    // Should we scroll up?
    if (isInTopEdge && canScrollUp) {
      const intensity = ((edgeTop - viewportY) / edgeSize);
      nextScrollY = (nextScrollY - (maxStep * intensity));
    }
    // Should we scroll down?
    else if (isInBottomEdge && canScrollDown) {
      const intensity = ((viewportY - edgeBottom) / edgeSize);
      nextScrollY = (nextScrollY + (maxStep * intensity));
    }
    
    // Sanitize invalid maximums. An invalid scroll offset won't break the
    // subsequent .scrollTo() call; however, it will make it harder to
    // determine if the .scrollTo() method should have been called in the
    // first place.
    nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
    nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));
    
    if (
      (nextScrollX !== currentScrollX) ||
      (nextScrollY !== currentScrollY)
    ) {
      (isBody ? window : container).scrollTo(nextScrollX, nextScrollY);
      return true;
    }
    else {
      return false;
    }
  }
  
  return true;
}
