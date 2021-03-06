


function CalendarElementControl() {
	Base.apply ( this, arguments );
	this.$date.date_changed.add ( new Delegate ( this, this.onDateChanged ) );
}
CalendarElementControl.Inherit ( Base, "CalendarElementControl" );
CalendarElementControl.Implement ( IUIControl );
CalendarElementControl.ImplementProperty ( "date", new InitializeObject ( "Current date", "ManagedDate" ) );
CalendarElementControl.ImplementProperty ( "selectedDate", new InitializeParameter ( "selectedDate", "" ) );
CalendarElementControl.ImplementProperty ( "templateSource", new InitializeParameter ( "selectedDate", ".calendarElement" ) );
CalendarElementControl.prototype.dayselection = new InitializeEvent ( "Fired when a date is selected." );
CalendarElementControl.prototype.toBeSelected = new InitializeNumericParameter ( "Number of the selected day.", -1 );
CalendarElementControl.prototype.expanderpath = new InitializeStringParameter ( "Path to the expander.", null );
CalendarElementControl.prototype.daysInMonth = new InitializeNumericParameter ( "Number of days in the current month", null );
CalendarElementControl.prototype.selectedCssClass = new InitializeStringParameter ( "CSS class used to display the selected item", null );
CalendarElementControl.prototype.$bodyElement = null;
CalendarElementControl.prototype.$expanderpath = null;
CalendarElementControl.prototype.$value = null;
CalendarElementControl.prototype.get_value = function(){
	return this.$selectedDate;
};
CalendarElementControl.prototype.set_value = function ( date ) {
	var resultDate = null;
	if ( !( date instanceof Date ) )
	{
		var re = /\/Date\(([+-]?\d+)\)\//i,
			matches = re.exec ( date );
		if ( matches != null ) {
			resultDate = new Date ( parseInt ( matches[1], 10 ) );
        }
	}
	else
	{
		resultDate = date;
	}
	
	this.$date.load ( resultDate );
	this.set_selectedDate ( resultDate );
	//this.dayselection.invoke ( this, null );
};
CalendarElementControl.prototype.$init = function () {
	// template
    var el = $(this.root),
		tml = $(this.get_templateSource()),
		self = this;
		
    el.empty();
    el.append(tml.children().clone());
    Base.prototype.$init.apply(this, arguments);
	this.$expanderpath = this.getRelatedElements ( this.expanderpath ).activeclass();
	
	var linkLocationTarget = this.child ( "calnedarkeyboardtarget" );
	linkLocationTarget.keydown ( function ( evnt ) {
		if ( linkLocationTarget.is ( ":focus" ) )
		{
			self.onKeyPress ( evnt, null );
		}
	});
};
CalendarElementControl.prototype.onDateChanged = function () {
	this.toBeSelected = this.$date.get_day();
	this.$selectedDate = new Date (
		this.$date.get_year(),
		this.$date.get_month(),
		this.$date.get_day(),
		this.$date.get_hours(),
		this.$date.get_minutes()
	);
	this.dayselection.invoke ( this, null );
	this.updateTargets();
};
CalendarElementControl.prototype.get_weeks = function() {
	
	var dateObj = new Date();
	var today = dateObj.getDate();
	
	dateObj.setFullYear ( this.$date.get_year() );	
	dateObj.setMonth ( this.$date.get_month() );
	dateObj.setDate ( 1 );
	
	var days = new Date ( dateObj.getFullYear(), dateObj.getMonth() + 1, 0 ).getDate();
	var daysInFirstWeek = ( ( 7 - dateObj.getDay() ) + 1 ) % 7;
	
	// not set
	if ( this.toBeSelected == -1 ) {
		this.toBeSelected = today;
	}
	// next month
	else if ( this.toBeSelected > days ) {
		this.$date.set_month ( 1 );
		this.toBeSelected = 1;
	}
	// prev month
	else if ( this.toBeSelected < 1 ) {
		this.$date.set_month ( -1 );
		days = new Date ( this.$date.get_year(), this.$date.get_month() + 1, 0 ).getDate();
		this.toBeSelected = days + this.toBeSelected;
	}
	
	var weeks = [], 
		week = [],
		i = 0,
		daysInPrevious = new Date ( this.$date.get_year(), this.$date.get_month(), 0 ).getDate();

	// if we want the days from previous month in the calendar
	var fullCallendar = false;
	if ( fullCallendar )
	{
		for ( i = ( daysInPrevious - ( 7 - daysInFirstWeek ) + 1 ); i <= daysInPrevious; i++ )
		{
			week.push ( { d: i, selected: "" } );
		}
	}
	else
	{
		for ( i = 0; i < 7 - daysInFirstWeek; i++ )
		{
			week.push ( { d: "&nbsp;", selected: "" } );
		}
	}
	
	if ( daysInFirstWeek != 0 ) {
		for ( i = 1; i <= daysInFirstWeek; i++ ) {
			week.push ( { d:i, selected : ( this.toBeSelected === i ? this.selectedCssClass : "" ) } );
		}	
		weeks.push ( week );
	}
	//all weeks in the current month
	week = [];
	for ( i = daysInFirstWeek + 1; i <= days; i++ ) {
		week.push ( { d: i, selected : ( this.toBeSelected === i ? this.selectedCssClass : "" ) } );
		if ( ( i - daysInFirstWeek ) % 7 === 0 || i === days) {
			// last week of the currewnt month
			if ( i === days && week.length < 7 ) {
				var n = 1;
				do {
					week.push ( { d: ( fullCallendar === true ? n.toString() : "&nbsp;" ), selected: "" } );
					n++;
				} while ( week.length < 7 );
			}
		
			weeks.push ( week );
			if ( i != days ) {
				week = [];
			}
		}
	}
	return weeks;
};
CalendarElementControl.prototype.onPrevMonth = function ( ev, dc, binding ) { this.$date.set_month ( this.$date.get_month() - 1 );	};
CalendarElementControl.prototype.onNextMonth = function ( ev, dc, binding ) { this.$date.set_month ( this.$date.get_month() + 1 );	};
CalendarElementControl.prototype.onPrevYear  = function ( ev, dc, binding ) { this.$date.set_year ( this.$date.get_year() - 1 );		};
CalendarElementControl.prototype.onNextYear  = function ( ev, dc, binding ) { this.$date.set_year ( this.$date.get_year() + 1 );		};
CalendarElementControl.prototype.onOpen = function ( e, dc, binding ) {
	this.child ( "calnedarkeyboardtarget" ).focus();
};
CalendarElementControl.prototype.onClose  = function ( ev, dc, binding ) { 
	this.$expanderpath.Collapse();
};
CalendarElementControl.prototype.onMouseClick = function ( ev, dc, binding ) {
	this.child ( "calnedarkeyboardtarget" ).focus();
	if ( !isNaN ( dc.d ) )
	{
		this.toBeSelected = dc.d;
		
		this.$date.set_day ( dc.d );
		
		this.dayselection.invoke ( ev, dc );
		this.updateTargets();
	}
};
CalendarElementControl.prototype.onKeyPress = function ( evnt, dc, binding  ) {
	if ( this.processKey ( evnt, dc ) ) {
		evnt.stopPropagation();
		evnt.preventDefault();
	}
};
CalendarElementControl.prototype.processKey = function ( ev, dc ) {
	switch ( ev.which )
	{
		case 13 : /* enter */ this.dayselection.invoke ( ev, dc ); return true;
		case 32 : /* space */ this.dayselection.invoke ( ev, dc ); return true;
		case 37 : /* left  */ this.$date.set_day ( this.$date.get_day() - 1 ); return true;
		case 38 : /* up    */ this.$date.set_day ( this.$date.get_day() - 7 ); return true;
		case 39 : /* right */ this.$date.set_day ( this.$date.get_day() + 1 ); return true;
		case 40 : /* down  */ this.$date.set_day ( this.$date.get_day() + 7 ); return true;
	}
	return false;
};