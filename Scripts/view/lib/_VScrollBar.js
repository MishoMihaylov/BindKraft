


// Unfinished yet
/*CLASS*/
function VScrollBar() {
    VScrollBar.apply(this, arguments);
}
VScrollBar.Inherit(Base, "VScrollBar");
VScrollBar.ImplementProperty("minvalue", new InitializeNumericParameter("The minimum value - the lower boundary", 0), null, "sizeScroller");
VScrollBar.ImplementProperty("maxvalue", new InitializeNumericParameter("The maximum value - the upper boundary", 40), null, "sizeScroller");
VScrollBar.ImplementProperty("arrowsize", new InitializeNumericParameter("Height of arrows", 16), null, "sizeScroller");
VScrollBar.ImplementProperty("smallmove", new InitializeNumericParameter("A size of the small step", 1));
VScrollBar.ImplementProperty("bigmove", new InitializeNumericParameter("A size of the big step", 10));
VScrollBar.ImplementProperty("posoffset", new InitializeNumericParameter("Pos offset", 20), null, "sizeScroller");
VScrollBar.ImplementProperty("poslimit", new InitializeNumericParameter("Pos limit", 10), null, "sizeScroller");
