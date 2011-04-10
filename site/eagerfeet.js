/*
	Copyright (c) 2011, Robert Kosara <rkosara@me.com>
	
	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted, provided that the above
	copyright notice and this permission notice appear in all copies.
	
	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
	WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
	MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
	ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
	WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
	ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
	OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

// from http://dansnetwork.com/javascript-iso8601rfc3339-date-parser/
Date.prototype.setISO8601 = function(dString){

	var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

	if (dString.toString().match(new RegExp(regexp))) {
		var d = dString.match(new RegExp(regexp));
		var offset = 0;
		
		this.setUTCDate(1);
		this.setUTCFullYear(parseInt(d[1],10));
		this.setUTCMonth(parseInt(d[3],10) - 1);
		this.setUTCDate(parseInt(d[5],10));
		this.setUTCHours(parseInt(d[7],10));
		this.setUTCMinutes(parseInt(d[9],10));
		this.setUTCSeconds(parseInt(d[11],10));
		if (d[12])
			this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
		else
			this.setUTCMilliseconds(0);
			if (d[13] != 'Z') {
				offset = (d[15] * 60) + parseInt(d[17],10);
				offset *= ((d[14] == '-') ? -1 : 1);
				this.setTime(this.getTime() - offset * 60 * 1000);
			}
		} else {
			this.setTime(Date.parse(dString));
	}
	return this;
};

// from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date
function pad(n) {
    return n < 10 ? '0' + n : n;
}

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var felt = ["", "Awesome", "So-So", "Sluggish", "Injured"];

var terrain = ["", "Road", "Trail", "Treadmill", "Track"];

var weather = ["", "Sunny", "Cloudy", "Rainy", "Snowy"];

function formatDate(date) {
	return months[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear();
}

function formatTime(date) {
	return date.getHours() + ":" + pad(date.getMinutes());
}

function lookup() {
	$('#progress').show();
	$('#submit').hide();
	var userID = $('#userID')[0].value.match(/(\d+)/)[0];
	$.get('http://eagerfeet.org/api/runs/'+userID, function(data) {
		$('#progress').hide();
		$('#submit').show();
		if (data.code == 0) {
			var runs = $('#runs')[0];
			var html = '<p>Found '+data.runs.length+' runs.</p>';
			var date = new Date();
			data.runs.forEach(function(run) {
				date.setISO8601(run.startTime);
				html += '<div class="run">';
				html += '<p><span class="title">Run '+formatDate(date)+'</span>, '+formatTime(date)+' &mdash; ';
				if (run.fileName.length == 0)
					html += '<i>no GPS data</i></p>';
				else
					html += '<a href="'+run.fileName+'">GPX File</a></p>';
				html += '<p>'+parseFloat(run.distance).toFixed(2)+' mi';
				if (run.calories > 0)
					html += ', '+Math.round(run.calories)+' calories';
				if (run.terrain > 0)
					html += ', '+terrain[run.terrain];
				if (run.weather > 0)
					html += ', '+weather[run.weather];
				if (run.howFelt > 0)
					html += ', '+felt[run.howFelt];
				if (run.description.length > 0)
					html += '</p><p>Comment: <i>'+run.description+'</i></p>';
				html += '</div>\n';
			});
			runs.innerHTML = html;
		} else {
			$('#runs')[0].innerHTML = '<p class="error">'+data.message+'</p>';
		}
	}).error(function() {
		$('#runs')[0].innerHTML = '<p class="error">Error: Server is down, please try again later.</p>';
		$('#progress').hide();
		$('#submit').show();
	});
	return false;
}
