jQuery(function() {
    var showtip = function (url, elem,xoffset) {

            var pos = elem.offset();
            var y_pos = pos.top - 12;
            var x_pos = pos.left + (xoffset || (elem.width() + 16));

            var tip_arrow = $('<img>').attr('src', './images/tip_arrow.png').addClass('tip_arrow');
            var tip_box = $('<div>').addClass('tip_box');
            var tip_shadow = $('<div>').addClass('tip_shadow');
            var tip_content = $('<div>').addClass('tip_content').load(url, function() {
                tip_content.prepend('<a href="#" class="tip_close"><i class="icon-remove-circle"></i></a>').append(tip_arrow);
            var width = $(window).width(),
                rtl = $('html').hasClass('rtl'),
                size = tip_content.outerWidth(),
                left = the_tip.position().left,
                left_room = left - size,
                right_room = width - size - left,
                flip = rtl
                    ? (left_room > 0 && left_room > right_room)
                    : (right_room < 0 && left_room > right_room);
                if (flip) {
                    the_tip.css({'left':x_pos-tip_content.outerWidth()-elem.width()-32+'px'});
                    tip_box.addClass('right');
                    tip_arrow.addClass('flip-x');
                }
            });

            var the_tip = tip_box.append(tip_content).prepend(tip_shadow);
            the_tip.css({
                "top":y_pos + "px",
                "left":x_pos + "px"
            }).addClass(elem.data('id'));
            $('.tip_box').remove();
            $('body').append(the_tip.hide().fadeIn());
            $('.' + elem.data('id') + ' .tip_shadow').css({
                "height":$('.' + elem.data('id')).height() + 5
            });
    },
    getHelpTips = (function() {
        var dfd, cache = {};
        return function(namespace) {
            var namespace = namespace
                || $('#content').data('tipNamespace')
                || $('meta[name=tip-namespace]').attr('content');
            if (!namespace)
                return $.Deferred().resolve().promise();
            else if (!cache[namespace])
                cache[namespace] = {
                  dfd: dfd = $.Deferred(),
                  ajax: $.ajax({
                    url: "ajax.php/help/tips/" + namespace,
                    dataType: 'json',
                    success: $.proxy(function (json_config) {
                        this.resolve(json_config);
                    }, dfd)
                  })
                }
            return cache[namespace].dfd;
        };
    })();

    var tip_id = 1;
    //Generic tip.
    $('.tip')
    .on('click mouseover', function(e) {
        e.preventDefault();
        if (!this.rel)
            this.rel = 'tip-' + (tip_id++);
        var id = this.rel,
            elem = $(this);

        elem.data('id',id);
        elem.data('timer',0);
        if ($('.' + id).length == 0) {
            if (e.type=='mouseover') {
                // wait about 1 sec - before showing the tip - mouseout kills
                // the timeout
                elem.data('timer',setTimeout(function() {
                    showtip('ajax.php/content/'+elem.attr('href').substr(1),elem);
                },750));
            } else {
                showtip('ajax.php/content/'+elem.attr('href').substr(1),elem);
            }
        }
    })
    .on('mouseout', function(e) {
        clearTimeout($(this).data('timer'));
    });

    $('.help-tip')
    .on('mouseover click', function(e) {
        e.preventDefault();

        var elem = $(this),
            pos = elem.offset(),
            y_pos = pos.top - 8,
            x_pos = pos.left + elem.width() + 16,
            tip_arrow = $('<img>')
                .attr('src', './images/tip_arrow.png')
                .addClass('tip_arrow'),
            tip_box = $('<div>')
                .addClass('tip_box'),
            tip_content = $('<div>')
                .append('<a href="#" class="tip_close"><i class="icon-remove-circle"></i></a>')
                .addClass('tip_content'),
            the_tip = tip_box
                .append(tip_content.append(tip_arrow))
                .css({
                    "top":y_pos + "px",
                    "left":x_pos + "px"
                }),
            tip_timer = setTimeout(function() {
                $('.tip_box').remove();
                $('body').append(the_tip.hide().fadeIn());
                var width = $(window).width(),
                    rtl = $('html').hasClass('rtl'),
                    size = tip_content.outerWidth(),
                    left = the_tip.position().left,
                    left_room = left - size,
                    right_room = width - size - left,
                    flip = rtl
                        ? (left_room > 0 && left_room > right_room)
                        : (right_room < 0 && left_room > right_room);
                if (flip) {
                    the_tip.css({'left':x_pos-tip_content.outerWidth()-40+'px'});
                    tip_box.addClass('right');
                    tip_arrow.addClass('flip-x');
                }
            }, 500);

        elem.on('mouseout', function() {
            clearTimeout(tip_timer);
        });

        getHelpTips().then(function(tips) {
            var href = elem.attr('href');
            if (href) {
                section = tips[elem.attr('href').substr(1)];
            }
            else if (elem.data('content')) {
                section = {title: elem.data('title'), content: elem.data('content')};
            }
            else {
                elem.remove();
                clearTimeout(tip_timer);
                return;
            }
            if (!section)
                return;
            tip_content.append(
                $('<h1>')
                    .append('<i class="icon-info-sign faded"> ')
                    .append(section.title)
                ).append(section.content);
            if (section.links) {
                var links = $('<div class="links">');
                $.each(section.links, function(i,l) {
                    var icon = l.href.match(/^http/)
                        ? 'icon-external-link' : 'icon-share-alt';
                    links.append($('<div>')
                        .append($('<a>')
                            .html(l.title)
                            .prepend('<i class="'+icon+'"></i> ')
                            .attr('href', l.href).attr('target','_blank'))
                    );
                });
                tip_content.append(links);
            }
        });
        $('.tip_shadow', the_tip).css({
            "height":the_tip.height() + 5
        });
    });

    //faq preview tip
    $('.previewfaq').on('mouseover', function(e) {
        e.preventDefault();
        var elem = $(this);

        var vars = elem.attr('href').split('=');
        var url = 'ajax.php/kb/faq/'+vars[1];
        var id='faq'+vars[1];
        var xoffset = 100;

        elem.data('id',id);
        elem.data('timer',0);
        if($('.' + id).length == 0) {
            if(e.type=='mouseover') {
                 /* wait about 1 sec - before showing the tip - mouseout kills the timeout*/
                 elem.data('timer',setTimeout(function() { showtip(url,elem,xoffset);},750))
            }else{
                showtip(url,elem,xoffset);
            }
        }
    }).on('mouseout', function(e) {
        clearTimeout($(this).data('timer'));
    });


    $('a.collaborators.preview').on('mouseover', function(e) {
        e.preventDefault();
        var elem = $(this);

        var url = 'ajax.php/'+elem.attr('href').substr(1)+'/preview';
        var xoffset = 100;
        elem.data('timer', 0);

        if (e.type=='mouseover') {
            elem.data('timer',setTimeout(function() { showtip(url, elem, xoffset);},750))
        } else {
            showtip(url,elem,xoffset);
        }
    }).on('mouseout', function(e) {
        clearTimeout($(this).data('timer'));
    }).on('click', function(e) {
        clearTimeout($(this).data('timer'));
        $('.tip_box').remove();
    });


    //Ticket preview
    $('.ticketPreview').on('mouseover', function(e) {
        e.preventDefault();
        var elem = $(this);

        var vars = elem.attr('href').split('=');
        var url = 'ajax.php/tickets/'+vars[1]+'/preview';
        var id='t'+vars[1];
        var xoffset = 80;

        elem.data('timer', 0);
        if(!elem.data('id')) {
            elem.data('id', id);
            if(e.type=='mouseover') {
                 /* wait about 1 sec - before showing the tip - mouseout kills the timeout*/
                 elem.data('timer',setTimeout(function() { showtip(url,elem,xoffset);},750))
            }else{
                clearTimeout(elem.data('timer'));
                showtip(url,elem,xoffset);
            }
        }
    }).on('mouseout', function(e) {
        $(this).data('id', 0);
        clearTimeout($(this).data('timer'));
    });

    //User preview
    $('.userPreview').on('mouseover', function(e) {
        e.preventDefault();
        var elem = $(this);

        var vars = elem.attr('href').split('=');
        var url = 'ajax.php/users/'+vars[1]+'/preview';
        var id='u'+vars[1];
        var xoffset = 80;

        elem.data('timer', 0);
        if(!elem.data('id')) {
            elem.data('id', id);
            if(e.type=='mouseover') {
                 /* wait about 1 sec - before showing the tip - mouseout kills the timeout*/
                 elem.data('timer',setTimeout(function() { showtip(url,elem,xoffset);},750))
            }else{
                clearTimeout(elem.data('timer'));
                showtip(url, elem, xoffset);
            }
        }
    }).on('mouseout', function(e) {
        $(this).data('id', 0);
        clearTimeout($(this).data('timer'));
    });

    $('body')
    .delegate('.tip_close', 'click', function(e) {
        e.preventDefault();
        $(this).parent().parent().remove();
    });

    $(document).on('mouseup', function (e) {
        var container = $('.tip_box');
        if (!container.is(e.target)
            && container.has(e.target).length === 0) {
            container.remove();
        }
    });
});

//code from wipage
/*
	for editing cells and add button
*/

	function init()
{
    var tables = document.getElementsByClassName("editabletable");
    var i;
    for (i = 0; i < tables.length; i++)
    {
        makeTableEditable(tables[i]);
    }
}

function makeTableEditable(table)
{
    var rows = table.rows;
    var r;
    for (r = 0; r < rows.length; r++)
    {
        var cols = rows[r].cells;
        var c;
        for (c = 0; c < cols.length; c++)
        {
            var cell = cols[c];
            var listener = makeEditListener(table, r, c);
            cell.addEventListener("input", listener, false);
        }
    }
}

function makeEditListener(table, row, col)
{
    return function(event)
    {
        var cell = getCellElement(table, row, col);
        var text = cell.innerHTML.replace(/<br>$/, '');
        var items = split(text);

        if (items.length === 1)
        {
            // Text is a single element, so do nothing.
            // Without this each keypress resets the focus.
            return;
        }

        var i;
        var r = row;
        var c = col;
        for (i = 0; i < items.length && r < table.rows.length; i++)
        {
            cell = getCellElement(table, r, c);
            cell.innerHTML = items[i]; // doesn't escape HTML

            c++;
            if (c === table.rows[r].cells.length)
            {
                r++;
                c = 0;
            }
        }
        cell.focus();
    };
}

function getCellElement(table, row, col)
{
    // assume each cell contains a div with the text
    return table.rows[row].cells[col].firstChild;
}

function split(str)
{
    // use comma and whitespace as delimiters
    return str.split(/,|\s|<br>/);
}

window.onload = init;

function displayResult()
{
	var table=document.getElementById("myTable");
	var row=table.insertRow(-1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell4=row.insertCell(0);
	var cell5=row.insertCell(0);
	cell1.style.textAlign="center";
	cell1.style.backgroundColor="#CCCCCC";
	cell2.style.textAlign="center";
	cell3.style.textAlign="left";
	cell4.style.textAlign="center";
	cell5.style.textAlign="center";
	
	
	
	cell1.innerHTML="<td><table width='100%'><tr><td align='left' width='1%'>$</td><td align='right' width='9%'>&nbsp</td></tr></table></td>";    
	
	cell2.innerHTML="<td><table width='100%'><tr><td align='left' width='1%'>$</td><td align='right' width='9%'><div contenteditable>&nbsp;</div></td></tr></table></td>";
	
	cell3.innerHTML="<td><div contenteditable>&nbsp;</div></td>";
	cell4.innerHTML="<td><div contenteditable>&nbsp;</div></td>";
	cell5.innerHTML="<td><div contenteditable>&nbsp;</div></td>";	
}

function updateTable(){
	var editable_table = document.getElementById("myTable");
	var fixed_table = document.getElementById("fixed_table");
	var final_table = document.getElementById("final_table");
	var rows = editable_table.rows;
	var qty;
	var unit_price;
	var total_price;
	var i;
	var value;
	for(i=1;i<rows.length;i++){
		value = '';
		qty = rows[i].cells[1].textContent;
		unit_price = rows[i].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		total_price = rows[i].cells[4].getElementsByTagName('table')[0].rows[0].cells[1];
		//alert(qty);
		if(qty=='' && unit_price==''){
			value = '';
			total_price.innerHTML = '';
		}
		
		else if(qty=='' || unit_price=='' || isNaN(qty) || isNaN(unit_price)){
			rows[i].cells[4].innerHTML = 'invalid';
			alert("There is invalid data in row "+i+". The page will be reloaded.");
			window.location.reload();
			break;
		}
		
		else {
			value = qty*unit_price;
			total_price.innerHTML = parseFloat(value).toFixed(2);
		}
		
		
	}
	
	var sum = 0;
	
	if(final_table.rows[1].cells[1].getElementsByTagName('table')[0].rows[0].cells[1].textContent==0)final_table.rows[1].cells[1].getElementsByTagName('table')[0].rows[0].cells[1].innerHTML="<td><div contenteditable>0.00</div></td>";
	if(fixed_table.rows[0].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent==0)fixed_table.rows[0].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].innerHTML="<td><div contenteditable>0.00</div></td>";
	if(fixed_table.rows[0].cells[1].textContent==0)fixed_table.rows[0].cells[1].innerHTML="<td><div contenteditable>0</div></td>";
	if(fixed_table.rows[1].cells[1].textContent==0)fixed_table.rows[1].cells[1].innerHTML="<td><div contenteditable>0</div></td>";
	if(fixed_table.rows[1].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent==0)fixed_table.rows[1].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].innerHTML="<td><div contenteditable>0.00</div></td>";
	
	for(i=1;i<rows.length;i++){
		if(rows[i].cells[4].textContent!='invalid')sum = sum + parseFloat(rows[i].cells[4].getElementsByTagName('table')[0].rows[0].cells[1].textContent);
	}
		
	labour_charge = fixed_table.rows[0].cells[1].textContent * fixed_table.rows[0].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
	onsiteCallOutFee = fixed_table.rows[1].cells[1].textContent * fixed_table.rows[1].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
	
	if(isNaN(labour_charge)){
		alert("Invalid Labour Charge");
		window.location.reload();
	}
	if(isNaN(onsiteCallOutFee)){
		alert("Invalid Onsite Callout Fee.");
		window.location.reload();
	}
	
	fixed_table.rows[0].cells[4].getElementsByTagName('table')[0].rows[0].cells[1].innerHTML = parseFloat(labour_charge).toFixed(2);
	fixed_table.rows[1].cells[4].getElementsByTagName('table')[0].rows[0].cells[1].innerHTML = parseFloat(onsiteCallOutFee).toFixed(2);
	sum = sum + parseFloat(labour_charge) + parseFloat(onsiteCallOutFee);
	var total = final_table.rows[2].cells[1].getElementsByTagName('table')[0].rows[0].cells[1];
	total.innerHTML = parseFloat(sum).toFixed(2);
	
	
	
	var GST = final_table.rows[1].cells[1].getElementsByTagName('table')[0].rows[0].cells[1];
	
	GST.innerHTML = parseFloat(total.textContent/11).toFixed(2);
	
	sum = total.textContent - GST.textContent;	

	var Net = final_table.rows[0].cells[1].getElementsByTagName('table')[0].rows[0].cells[1];
	Net.innerHTML = parseFloat(sum).toFixed(2);
}

function createInput(){
		var editable_table = document.getElementById("myTable");
		var fixed_table = document.getElementById("fixed_table");
		var final_table = document.getElementById("final_table");
		var rows = editable_table.rows;
		var qty;
		var unit_price;
		var total_price;
		var i;
		var value;
		
		var data_row = 0;
		var oldstr,newstr;
		for(i=1;i<rows.length;i++){
			oldstr = rows[i].cells[0].textContent;
			newstr = oldstr.replace(/\s+/g,"");
			if(newstr=='');
			else data_row++;	
		}
		
		
		var form = document.getElementById('save');
		var codeinp,qtyinp,desinp,upinp,totinp;
		var j,atname;
		
		for(i=1,j=1;i<rows.length;i++){
			oldstr = rows[i].cells[0].textContent;
			newstr = oldstr.replace(/\s+/g,"");
			if(newstr=='');
			else{
				json = rows[i].cells[0].textContent;
				atname = "codeinp"+j;
				codeinp = document.createElement("input");
				codeinp.setAttribute("type","hidden");
				codeinp.setAttribute("name", atname);
				codeinp.setAttribute("value", json);
				form.appendChild(codeinp);
				
				json = rows[i].cells[1].textContent;
				atname = "qtyinp"+j;
				qtyinp = document.createElement("input");
				qtyinp.setAttribute("type","hidden");
				qtyinp.setAttribute("name", atname);
				qtyinp.setAttribute("value", json);
				form.appendChild(qtyinp);
				
				json = rows[i].cells[2].textContent;
				atname = "desinp"+j;
				desinp = document.createElement("input");
				desinp.setAttribute("type","hidden");
				desinp.setAttribute("name", atname);
				desinp.setAttribute("value", json);
				form.appendChild(desinp);
				
				json = rows[i].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
				atname = "upinp"+j;
				upinp = document.createElement("input");
				upinp.setAttribute("type","hidden");
				upinp.setAttribute("name", atname);
				upinp.setAttribute("value", json);
				form.appendChild(upinp);
				
				json = rows[i].cells[4].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
				atname = "totinp"+j;
				totinp = document.createElement("input");
				totinp.setAttribute("type","hidden");
				totinp.setAttribute("name", atname);
				totinp.setAttribute("value", json);
				form.appendChild(totinp);	
				j++;
			}
		}
		
		var rowinp;
		json = data_row;
		atname = "data_row";
		rowinp = document.createElement("input");
		rowinp.setAttribute("type","hidden");
		rowinp.setAttribute("name", atname);
		rowinp.setAttribute("value", json);
		form.appendChild(rowinp);		
		
		var labqtyinp, labourinp, labourtotinp, onsiteqtyinp, onsiteinp, ontotinp, net_priceinp, gstinp, grand_totalinp;
		
		json = fixed_table.rows[0].cells[1].textContent;
		atname = "labourqty";
		labqtyinp = document.createElement("input");
		labqtyinp.setAttribute("type","hidden");
		labqtyinp.setAttribute("name", atname);
		labqtyinp.setAttribute("value", json);
		form.appendChild(labqtyinp);
		
		json = fixed_table.rows[0].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		atname = "labour";
		labourinp = document.createElement("input");
		labourinp.setAttribute("type","hidden");
		labourinp.setAttribute("name", atname);
		labourinp.setAttribute("value", json);
		form.appendChild(labourinp);
		
		json = fixed_table.rows[0].cells[4].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		atname = "labourtot";
		labourtotinp = document.createElement("input");
		labourtotinp.setAttribute("type","hidden");
		labourtotinp.setAttribute("name", atname);
		labourtotinp.setAttribute("value", json);
		form.appendChild(labourtotinp);
		
		json = fixed_table.rows[1].cells[1].textContent;
		atname = "onsiteqty";
		onsiteqtyinp = document.createElement("input");
		onsiteqtyinp.setAttribute("type","hidden");
		onsiteqtyinp.setAttribute("name", atname);
		onsiteqtyinp.setAttribute("value", json);
		form.appendChild(onsiteqtyinp);
		
		json = fixed_table.rows[1].cells[3].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		atname = "onsitefee";
		onsiteinp = document.createElement("input");
		onsiteinp.setAttribute("type","hidden");
		onsiteinp.setAttribute("name", atname);
		onsiteinp.setAttribute("value", json);
		form.appendChild(onsiteinp);
		
		json = fixed_table.rows[1].cells[4].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		atname = "ontotal";
		ontotinp = document.createElement("input");
		ontotinp.setAttribute("type","hidden");
		ontotinp.setAttribute("name", atname);
		ontotinp.setAttribute("value", json);
		form.appendChild(ontotinp);
		
		json = final_table.rows[0].cells[1].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		atname = "net_price";
		net_priceinp = document.createElement("input");
		net_priceinp.setAttribute("type","hidden");
		net_priceinp.setAttribute("name", atname);
		net_priceinp.setAttribute("value", json);
		form.appendChild(net_priceinp);
		
		json = final_table.rows[1].cells[1].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		atname = "gst";
		gstinp = document.createElement("input");
		gstinp.setAttribute("type","hidden");
		gstinp.setAttribute("name", atname);
		gstinp.setAttribute("value", json);
		form.appendChild(gstinp);
		
		json = final_table.rows[2].cells[1].getElementsByTagName('table')[0].rows[0].cells[1].textContent;
		atname = "grand_total";
		grand_totalinp = document.createElement("input");
		grand_totalinp.setAttribute("type","hidden");
		grand_totalinp.setAttribute("name", atname);
		grand_totalinp.setAttribute("value", json);
		form.appendChild(grand_totalinp);		
		//form.submit();
	}

function reloadPage(){
	reload();
}

// ends wipage

// add hong
function displayLicense(type1, type2, type3, number1, number2, number3)
{
	var table=document.getElementById("myTable");

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	var cellStr1 = "<td><select style='width:100%;' name='slicense[type1][]'><option value=''>&lt;Select&gt;</option>" + 
				"<option value='eight_user'" + ((type1=="eight_user")? "selected='selected' ":"") + ">8 User Extension</option>" + 
				"<option value='sixt_user'" + ((type1=="sixt_user")?" selected='selected' ":"") + ">16 User Extension</option>" + 
				"<option value='thirtwo_user'" + ((type1=="thirtwo_user")?" selected='selected' ":"") + ">32 User Extension</option>" + 
				"<option value='sixtfour_user'" + ((type1=="sixtfour_user")?" selected='selected' ":"") + ">64 User Extension</option>" + 
				"<option value='barge_in'" + ((type1=="barge_in")?" selected='selected' ":"") + ">Barge In</option>" + 
				"<option value='call_rec'" + ((type1=="call_rec")?" selected='selected' ":"") + ">Call Recording</option>" + 
				 "<option value='conf_bridge'" + ((type1=="conf_bridge")?" selected='selected' ":"")+ ">Conference Bridge</option>" + 
				 "<option value='video_conf'" + ((type1=="video_conf")?" selected='selected' ":"") + ">Video Conference </option>" + 
				 "<option value='dcc'" + ((type1=="dcc")?" selected='selected' ":"") + ">DCC Support</option>" + 
				 "<option value='acd'" + ((type1=="acd")?" selected='selected' ":"") + ">ACD</option>" + 
			     "<option value='auto_dial'" + ((type1=="auto_dial")?" selected='selected' ":"") + ">Auto Dialler</option>" + 
			     "</select></td>";
	var cellStr2 = "<td><select style='width:100%;' name='slicense[type2][]'><option value=''>&lt;Select&gt;</option>" + 
				"<option value='eight_user'" + ((type2=="eight_user")? "selected='selected' ":"") + ">8 User Extension</option>" + 
				"<option value='sixt_user'" + ((type2=="sixt_user")?" selected='selected' ":"") + ">16 User Extension</option>" + 
				"<option value='thirtwo_user'" + ((type2=="thirtwo_user")?" selected='selected' ":"") + ">32 User Extension</option>" + 
				"<option value='sixtfour_user'" + ((type2=="sixtfour_user")?" selected='selected' ":"") + ">64 User Extension</option>" + 
				"<option value='barge_in'" + ((type2=="barge_in")?" selected='selected' ":"") + ">Barge In</option>" + 
				"<option value='call_rec'" + ((type2=="call_rec")?" selected='selected' ":"") + ">Call Recording</option>" + 
				 "<option value='conf_bridge'" + ((type2=="conf_bridge")?" selected='selected' ":"")+ ">Conference Bridge</option>" + 
				 "<option value='video_conf'" + ((type2=="video_conf")?" selected='selected' ":"") + ">Video Conference </option>" + 
				 "<option value='dcc'" + ((type2=="dcc")?" selected='selected' ":"") + ">DCC Support</option>" + 
				 "<option value='acd'" + ((type2=="acd")?" selected='selected' ":"") + ">ACD</option>" + 
			     "<option value='auto_dial'" + ((type2=="auto_dial")?" selected='selected' ":"") + ">Auto Dialler</option>" + 
			     "</select></td>";
     var cellStr3 = "<td><select style='width:100%;' name='slicense[type3][]'><option value=''>&lt;Select&gt;</option>" + 
					"<option value='eight_user'" + ((type3=="eight_user")? "selected='selected' ":"") + ">8 User Extension</option>" + 
					"<option value='sixt_user'" + ((type3=="sixt_user")?" selected='selected' ":"") + ">16 User Extension</option>" + 
					"<option value='thirtwo_user'" + ((type3=="thirtwo_user")?" selected='selected' ":"") + ">32 User Extension</option>" + 
					"<option value='sixtfour_user'" + ((type3=="sixtfour_user")?" selected='selected' ":"") + ">64 User Extension</option>" + 
					"<option value='barge_in'" + ((type3=="barge_in")?" selected='selected' ":"") + ">Barge In</option>" + 
					"<option value='call_rec'" + ((type3=="call_rec")?" selected='selected' ":"") + ">Call Recording</option>" + 
					 "<option value='conf_bridge'" + ((type3=="conf_bridge")?" selected='selected' ":"")+ ">Conference Bridge</option>" + 
					 "<option value='video_conf'" + ((type3=="video_conf")?" selected='selected' ":"") + ">Video Conference </option>" + 
					 "<option value='dcc'" + ((type3=="dcc")?" selected='selected' ":"") + ">DCC Support</option>" + 
					 "<option value='acd'" + ((type3=="acd")?" selected='selected' ":"") + ">ACD</option>" + 
				     "<option value='auto_dial'" + ((type3=="auto_dial")?" selected='selected' ":"") + ">Auto Dialler</option>" + 
				     "</select></td>";

	cell1.innerHTML="<td><b>License Type</b></td>";
	cell2.innerHTML=cellStr1;
	cell3.innerHTML=cellStr2;
	cell4.innerHTML=cellStr3;

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	cell1.innerHTML="<td><b>License Number</b></td>";
	cell2.innerHTML= "<td><input type='text'  style='width:98%;' value='" + number1 + "' name='slicense[num1][]'/></td>";
	cell3.innerHTML= "<td><input type='text'  style='width:98%;' value='" + number2 + "' name='slicense[num2][]'/></td>";
	cell4.innerHTML= "<td><input type='text'  style='width:98%;' value='" + number3 + "' name='slicense[num3][]'/></td>";
	
}

function addLicense()
{
	var table=document.getElementById("myTable");

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	var cellStrOption = 
		"<option value='eight_user'>8 User Extension</option>" + 
		"<option value='sixt_user'>16 User Extension</option>" + 
		"<option value='thirtwo_user'>32 User Extension</option>" + 
		"<option value='sixtfour_user'>64 User Extension</option>" + 
		"<option value='barge_in'>Barge In</option>" + 
		"<option value='call_rec'>Call Recording</option>" + 
		 "<option value='conf_bridge'>Conference Bridge</option>" + 
		 "<option value='video_conf'>Video Conference </option>" + 
		 "<option value='dcc'>DCC Support</option>" + 
		 "<option value='acd'>ACD</option>" + 
	     "<option value='auto_dial'>Auto Dialler</option>" + 
	     "</select></td>";

	cell1.innerHTML="<td><b>License Type</b></td>";
	cell2.innerHTML="<td><select style='width:100%;' name='slicense[type1][]'><option value=''>&lt;Select&gt;</option>" + cellStrOption;
	cell3.innerHTML="<td><select style='width:100%;' name='slicense[type2][]'><option value=''>&lt;Select&gt;</option>" + cellStrOption;
	cell4.innerHTML="<td><select style='width:100%;' name='slicense[type3][]'><option value=''>&lt;Select&gt;</option>" + cellStrOption;

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	cell1.innerHTML="<td><b>License Number</b></td>";
	cell2.innerHTML= "<td><input type='text' style='width:98%;' name='slicense[num1][]'/></td>";
	cell3.innerHTML= "<td><input type='text' style='width:98%;' name='slicense[num2][]'/></td>";
	cell4.innerHTML= "<td><input type='text' style='width:98%;' name='slicense[num3][]'/></td>";
	
}

function displayHardware(type1, type2, type3, model1, model2, model3, qty1, qty2, qty3)
{
	var table=document.getElementById("myTable2");

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	var cellStr1 = "<td><select style='width:100%;' name='hwd[type1][]'><option value=''>&lt;Select&gt;</option>" + 
				"<option value='poe_s_five'" + ((type1=="poe_s_five")? "selected='selected' ":"") + ">PoE Switch - 5 Port</option>" + 
				"<option value='poe_s_eight'" + ((type1=="poe_s_eight")? "selected='selected' ":"") + ">PoE Switch - 8 Port</option>" + 
				"<option value='poe_s_sixt'" + ((type1=="poe_s_sixt")? "selected='selected' ":"") + ">PoE Switch - 16 Port</option>" + 
				"<option value='poe_s_twfour'" + ((type1=="poe_s_twfour")? "selected='selected' ":"") + ">PoE Switch - 24 Port</option>" + 
				"<option value='poe_s_foteight'" + ((type1=="poe_s_foteight")? "selected='selected' ":"") + ">PoE Switch - 48 Port</option>" + 
				"<option value='ups'" + ((type1=="ups")? "selected='selected' ":"") + ">UPS</option>" + 
				"<option value='router'" + ((type1=="router")? "selected='selected' ":"") + ">Router</option>" + 
				"<option value='modem'" + ((type1=="modem")? "selected='selected' ":"") + ">Modem</option>" + 
				"<option value='sip_hand'" + ((type1=="sip_hand")? "selected='selected' ":"") + ">SIP Handset</option>" + 
				"<option value='sip_sidecar'" + ((type1=="sip_sidecar")? "selected='selected' ":"") + ">SIP Sidecar Console</option>" + 
				"<option value='sip_confphone'" + ((type1=="sip_confphone")? "selected='selected' ":"") + ">SIP Conference Phone</option>" + 
				"<option value='sip_cordlessphone'" + ((type1=="sip_cordlessphone")? "selected='selected' ":"") + ">SIP Cordless Phone</option>" + 
				"<option value='corded_haed'" + ((type1=="corded_haed")? "selected='selected' ":"") + ">Corded Headset</option>" + 
				"<option value='cordless_head'" + ((type1=="cordless_head")? "selected='selected' ":"") + ">Cordless Headset</option>" + 
				"<option value='other'" + ((type1=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option>" + 
				"</select></td>";
	var cellStr2 = "<td><select style='width:100%;' name='hwd[type2][]'><option value=''>&lt;Select&gt;</option>" + 
				"<option value='poe_s_five'" + ((type2=="poe_s_five")? "selected='selected' ":"") + ">PoE Switch - 5 Port</option>" + 
				"<option value='poe_s_eight'" + ((type2=="poe_s_eight")? "selected='selected' ":"") + ">PoE Switch - 8 Port</option>" + 
				"<option value='poe_s_sixt'" + ((type2=="poe_s_sixt")? "selected='selected' ":"") + ">PoE Switch - 16 Port</option>" + 
				"<option value='poe_s_twfour'" + ((type2=="poe_s_twfour")? "selected='selected' ":"") + ">PoE Switch - 24 Port</option>" + 
				"<option value='poe_s_foteight'" + ((type2=="poe_s_foteight")? "selected='selected' ":"") + ">PoE Switch - 48 Port</option>" + 
				"<option value='ups'" + ((type2=="ups")? "selected='selected' ":"") + ">UPS</option>" + 
				"<option value='router'" + ((type2=="router")? "selected='selected' ":"") + ">Router</option>" + 
				"<option value='modem'" + ((type2=="modem")? "selected='selected' ":"") + ">Modem</option>" + 
				"<option value='sip_hand'" + ((type2=="sip_hand")? "selected='selected' ":"") + ">SIP Handset</option>" + 
				"<option value='sip_sidecar'" + ((type2=="sip_sidecar")? "selected='selected' ":"") + ">SIP Sidecar Console</option>" + 
				"<option value='sip_confphone'" + ((type2=="sip_confphone")? "selected='selected' ":"") + ">SIP Conference Phone</option>" + 
				"<option value='sip_cordlessphone'" + ((type2=="sip_cordlessphone")? "selected='selected' ":"") + ">SIP Cordless Phone</option>" + 
				"<option value='corded_haed'" + ((type2=="corded_haed")? "selected='selected' ":"") + ">Corded Headset</option>" + 
				"<option value='cordless_head'" + ((type2=="cordless_head")? "selected='selected' ":"") + ">Cordless Headset</option>" + 
				"<option value='other'" + ((type2=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option>" + 
			     "</select></td>";
     var cellStr3 = "<td><select style='width:100%;' name='hwd[type3][]'><option value=''>&lt;Select&gt;</option>" + 
		     	"<option value='poe_s_five'" + ((type3=="poe_s_five")? "selected='selected' ":"") + ">PoE Switch - 5 Port</option>" + 
				"<option value='poe_s_eight'" + ((type3=="poe_s_eight")? "selected='selected' ":"") + ">PoE Switch - 8 Port</option>" + 
				"<option value='poe_s_sixt'" + ((type3=="poe_s_sixt")? "selected='selected' ":"") + ">PoE Switch - 16 Port</option>" + 
				"<option value='poe_s_twfour'" + ((type3=="poe_s_twfour")? "selected='selected' ":"") + ">PoE Switch - 24 Port</option>" + 
				"<option value='poe_s_foteight'" + ((type3=="poe_s_foteight")? "selected='selected' ":"") + ">PoE Switch - 48 Port</option>" + 
				"<option value='ups'" + ((type3=="ups")? "selected='selected' ":"") + ">UPS</option>" + 
				"<option value='router'" + ((type3=="router")? "selected='selected' ":"") + ">Router</option>" + 
				"<option value='modem'" + ((type3=="modem")? "selected='selected' ":"") + ">Modem</option>" + 
				"<option value='sip_hand'" + ((type3=="sip_hand")? "selected='selected' ":"") + ">SIP Handset</option>" + 
				"<option value='sip_sidecar'" + ((type3=="sip_sidecar")? "selected='selected' ":"") + ">SIP Sidecar Console</option>" + 
				"<option value='sip_confphone'" + ((type3=="sip_confphone")? "selected='selected' ":"") + ">SIP Conference Phone</option>" + 
				"<option value='sip_cordlessphone'" + ((type3=="sip_cordlessphone")? "selected='selected' ":"") + ">SIP Cordless Phone</option>" + 
				"<option value='corded_haed'" + ((type3=="corded_haed")? "selected='selected' ":"") + ">Corded Headset</option>" + 
				"<option value='cordless_head'" + ((type3=="cordless_head")? "selected='selected' ":"") + ">Cordless Headset</option>" + 
				"<option value='other'" + ((type3=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option>" + 
				"</select></td>";

	cell1.innerHTML="<td><b>Harware Type</b></td>";
	cell2.innerHTML=cellStr1;
	cell3.innerHTML=cellStr2;
	cell4.innerHTML=cellStr3;

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	cell1.innerHTML="<td><b>Model</b></td>";
	cell2.innerHTML= "<td><input type='text'  style='width:98%;' value='" + model1 + "' name='hwd[model1][]'/></td>";
	cell3.innerHTML= "<td><input type='text'  style='width:98%;' value='" + model2 + "' name='hwd[model2][]'/></td>";
	cell4.innerHTML= "<td><input type='text'  style='width:98%;' value='" + model3 + "' name='hwd[model3][]'/></td>";
	
	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	cell1.innerHTML="<td><b>Quantity</b></td>";
	cell2.innerHTML= "<td><input type='text'  size='7' value='" + qty1 + "' name='hwd[qty1][]'/></td>";
	cell3.innerHTML= "<td><input type='text'  size='7' value='" + qty2 + "' name='hwd[qty2][]'/></td>";
	cell4.innerHTML= "<td><input type='text'  size='7' value='" + qty3 + "' name='hwd[qty3][]'/></td>";
	
}

function addHardware()
{
	var table=document.getElementById("myTable2");

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	var cellStrOption = 
		"<option value='poe_s_five'>PoE Switch - 5 Port</option>" + 
		"<option value='poe_s_eight'>PoE Switch - 8 Port</option>" + 
		"<option value='poe_s_sixt'>PoE Switch - 16 Port</option>" + 
		"<option value='poe_s_twfour'>PoE Switch - 24 Port</option>" + 
		"<option value='poe_s_foteight'>PoE Switch - 48 Port</option>" + 
		"<option value='ups'>UPS</option>" + 
		"<option value='router'>Router</option>" + 
		"<option value='modem'>Modem</option>" + 
		"<option value='sip_hand'>SIP Handset</option>" + 
		"<option value='sip_sidecar'>SIP Sidecar Console</option>" + 
		"<option value='sip_confphone'>SIP Conference Phone</option>" + 
		"<option value='sip_cordlessphone'>SIP Cordless Phone</option>" + 
		"<option value='corded_haed'>Corded Headset</option>" + 
		"<option value='cordless_head'>Cordless Headset</option>" + 
		"<option value='other'>&lt;Other&gt;</option>" + 
	     "</select></td>";

	cell1.innerHTML="<td><b>Hardware Type</b></td>";
	cell2.innerHTML="<td><select style='width:100%;' name='hwd[type1][]'><option value=''>&lt;Select&gt;</option>" + cellStrOption;
	cell3.innerHTML="<td><select style='width:100%;' name='hwd[type2][]'><option value=''>&lt;Select&gt;</option>" + cellStrOption;
	cell4.innerHTML="<td><select style='width:100%;' name='hwd[type3][]'><option value=''>&lt;Select&gt;</option>" + cellStrOption;

	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	cell1.innerHTML="<td><b>Model</b></td>";
	cell2.innerHTML= "<td><input type='text' style='width:98%;' name='hwd[model1][]'/></td>";
	cell3.innerHTML= "<td><input type='text' style='width:98%;' name='hwd[model2][]'/></td>";
	cell4.innerHTML= "<td><input type='text' style='width:98%;' name='hwd[model3][]'/></td>";
	
	var row=table.insertRow(-1);
	var cell4=row.insertCell(0);
	var cell3=row.insertCell(0);
	var cell2=row.insertCell(0);
	var cell1=row.insertCell(0);

	cell1.innerHTML="<td><b>Quantity</b></td>";
	cell2.innerHTML= "<td><input type='text' size='7' name='hwd[qty1][]'/></td>";
	cell3.innerHTML= "<td><input type='text' size='7' name='hwd[qty2][]'/></td>";
	cell4.innerHTML= "<td><input type='text' size='7' name='hwd[qty3][]'/></td>";
	
}

function displayHardwareWifi(ssidname, ssidpwd, svcname, peip, svcother, peipuser, devtype, peippwd, 
	devtypeother, devbrand, authip, devmodel, authuser, devserial, authpwd)
{
	var table=document.getElementById("myTable3");

	var row=table.insertRow(-1);
	row.innerHTML="<th align='left' ><b>Wireless Details</b></th><th></th><th></th><th></th>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>SSID Name : </span></td><td><input type='text' size='40' value='" + ssidname + "' name='hwdwifi[ssidname][]'></td><td></td><td></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>SSID Password : </span></td><td><input type='text' size='40' value='" + ssidpwd + "' name='hwdwifi[ssidpwd][]'></td><td></td><td></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td colspan='2'><b>Wireless Access Point (AP)</b></td><td colspan='2'><b>Device Access Details</b></td>";

	var row=table.insertRow(-1);
	var selSvcStrOption = 
	"<option value='wifi_office'" + ((svcname=="wifi_office")? "selected='selected' ":"") + ">Office Wi-Fi</option>" + 
	"<option value='wifi_public'" + ((svcname=="wifi_public")? "selected='selected' ":"") + ">Public Wi-Fi</option>" + 
	"<option value='wifi_private'" + ((svcname=="wifi_private")? "selected='selected' ":"") + ">Private Wi-Fi</option>" + 
	"<option value='wifi_shared'" + ((svcname=="wifi_shared")? "selected='selected' ":"") + ">Shared Wi-Fi</option>" + 
	"<option value='wifi_customer'" + ((svcname=="wifi_customer")? "selected='selected' ":"") + ">Customer Wi-Fi</option>" + 
	"<option value='other'>&lt;Other&gt;</option>" + 
	"</select></td>";
	row.innerHTML="<td><span style='color:black;'>Service Name : </span></td>" + 
	"<td><select name='hwdwifi[svcname][]' style='width:70%;' ><option value=''>&lt;Select&gt;</option>" + selSvcStrOption +
	"<td><span style='color:black;'>PE IP Address :</span></td><td><input name='hwdwifi[peip][]' value='" + peip + "'  type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Other : </span></td><td><input name='hwdwifi[svcother][]'  value='" + svcother + "' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>User Name :</span></td><td><input name='hwdwifi[peipuser][]' value='" + peipuser + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	var selDevStrOption = 
	"<option value='dev_ap'" + ((devtype=="dev_ap")? "selected='selected' ":"") + ">AP Device</option>" + 
	"<option value='dev_wifimodem'" + ((devtype=="dev_wifimodem")? "selected='selected' ":"") + ">Wi-Fi Modem</option>" + 
	"<option value='dev_wifirouter'" + ((devtype=="dev_wifirouter")? "selected='selected' ":"") + ">Wi-Fi Router</option>" + 
	"<option value='dev_wifiippbx'" + ((devtype=="dev_wifiippbx")? "selected='selected' ":"") + ">Wi-Fi IPPBX</option>" + 
	"<option value='other'>&lt;Other&gt;</option>" + 
	"</select></td>";
	row.innerHTML="<td><span style='color:black;'>Device Type : </span></td>" + 
	"<td><select name='hwdwifi[devtype][]' style='width:70%;' ><option value=''>&lt;Select&gt;</option>" + selDevStrOption +
	"<td><span style='color:black;'>Password :</span></td><td><input name='hwdwifi[peippwd][]' value='" + peippwd + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Other : </span></td><td><input name='hwdwifi[devtypeother][]' value='" + devtypeother + "' type='text' style='width:70%;' ></td>" + 
	" <td colspan='2'>Authentication Details</td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Brand : </span></td><td><input name='hwdwifi[devbrand][]' value='" + devbrand + "' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>IP Address :</span></td><td><input name='hwdwifi[authip][]' value='" + authip + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Model : </span></td><td><input name='hwdwifi[devmodel][]' value='" + devmodel + "' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>User Name :</span></td><td><input name='hwdwifi[authuser][]' value='" + authuser + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Serial Number : </span></td><td><input name='hwdwifi[devserial][]' value='" + devserial + "' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>Password :</span></td><td><input name='hwdwifi[authpwd][]' value='" + authpwd + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='4'><hr/></td>";
}

function addHardwareWifi()
{
	var table=document.getElementById("myTable3");

	var row=table.insertRow(-1);
	row.innerHTML="<th align='left' ><b>Wireless Details</b></th><th></th><th></th><th></th>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>SSID Name : </span></td><td><input type='text' size='40' name='hwdwifi[ssidname][]'></td><td></td><td></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>SSID Password : </span></td><td><input type='text' size='40' name='hwdwifi[ssidpwd][]'></td><td></td><td></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td colspan='2'><b>Wireless Access Point (AP)</b></td><td colspan='2'><b>Device Access Details</b></td>";

	var row=table.insertRow(-1);
	var selSvcStrOption = 
	"<option value='wifi_office'>Office Wi-Fi</option>" + 
	"<option value='wifi_public'>Public Wi-Fi</option>" + 
	"<option value='wifi_private'>Private Wi-Fi</option>" + 
	"<option value='wifi_shared'>Shared Wi-Fi</option>" + 
	"<option value='wifi_customer'>Customer Wi-Fi</option>" + 
	"<option value='other'>&lt;Other&gt;</option>" + 
	"</select></td>";
	row.innerHTML="<td><span style='color:black;'>Service Name : </span></td>" + 
	"<td><select name='hwdwifi[svcname][]' style='width:70%;' ><option value=''>&lt;Select&gt;</option>" + selSvcStrOption +
	"<td><span style='color:black;'>PE IP Address :</span></td><td><input name='hwdwifi[peip][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Other : </span></td><td><input name='hwdwifi[svcother][]' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>User Name :</span></td><td><input name='hwdwifi[peipuser][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	var selDevStrOption = 
	"<option value='dev_ap'>AP Device</option>" + 
	"<option value='dev_wifimodem'>Wi-Fi Modem</option>" + 
	"<option value='dev_wifirouter'>Wi-Fi Router</option>" + 
	"<option value='dev_wifiippbx'>Wi-Fi IPPBX</option>" + 
	"<option value='other'>&lt;Other&gt;</option>" + 
	"</select></td>";
	row.innerHTML="<td><span style='color:black;'>Device Type : </span></td>" + 
	"<td><select name='hwdwifi[devtype][]' style='width:70%;' ><option value=''>&lt;Select&gt;</option>" + selDevStrOption +
	"<td><span style='color:black;'>Password :</span></td><td><input name='hwdwifi[peippwd][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Other : </span></td><td><input name='hwdwifi[devtypeother][]' type='text' style='width:70%;' ></td>" + 
	" <td colspan='2'>Authentication Details</td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Brand : </span></td><td><input name='hwdwifi[devbrand][]' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>IP Address :</span></td><td><input name='hwdwifi[authip][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Model : </span></td><td><input name='hwdwifi[devmodel][]' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>User Name :</span></td><td><input name='hwdwifi[authuser][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Serial Number : </span></td><td><input name='hwdwifi[devserial][]' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>Password :</span></td><td><input name='hwdwifi[authpwd][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='4'><hr/></td>";

}

function displayHardwarePassword(device_service, other, brand, model, serial_number, ip_address, mac_address, device_url_ip_address, device_username, device_password,
	description, service_url_ip_address, service_username, service_password, service1_ssid, service1_password, service2_ssid, service2_password, type)
{
	var table=document.getElementById("myTable8");
	
	var row=table.insertRow(-1);
	row.innerHTML="<th align='left' colspan='2'><b>Product/Service Details</b></th><th></th><th></th><th></th>";

	var row=table.insertRow(-1);
	var selSvcStrOption = 
		"<option value='desktop_computer' "+ ((device_service=="desktop_computer")? "selected='selected' ":"") + ">Desktop Computer</option>" + 
		"<option value='domain_name' "+ ((device_service=="domain_name")? "selected='selected' ":"") + ">Domain Name</option>" + 
		"<option value='ip_handset' "+ ((device_service=="ip_handset")? "selected='selected' ":"") + ">IP Handset</option>" + 
		"<option value='mobile_phone' "+ ((device_service=="mobile_phone")? "selected='selected' ":"") + ">Mobile Phone</option>" + 
		"<option value='modem_router' "+ ((device_service=="modem_router")? "selected='selected' ":"") + ">Modem/Router</option>" + 
		"<option value='network_switch' "+ ((device_service=="network_switch")? "selected='selected' ":"") + ">Network Switch</option>" + 
		"<option value='notebook' "+ ((device_service=="notebook")? "selected='selected' ":"") + ">Notebook</option>" + 
		"<option value='operating_system' "+ ((device_service=="operating_system")? "selected='selected' ":"") + ">Operating System</option>" + 
		"<option value='photocopier' "+ ((device_service=="photocopier")? "selected='selected' ":"") + ">Photocopier</option>" + 
		"<option value='sercurity_camera_nvr' " + ((device_service == "sercurity_camera_nvr") ? "selected='selected'" : "") + "'>Security Camera NVR</option>" + 
		"<option value='server_computer' "+ ((device_service=="server_computer")? "selected='selected' ":"") + ">Server Computer</option>" + 
		"<option value='software' "+ ((device_service=="software")? "selected='selected' ":"") + ">Software</option>" + 
		"<option value='tablet' "+ ((device_service=="tablet")? "selected='selected' ":"") + ">Tablet</option>" + 
		"<option value='web_hosting' "+ ((device_service=="web_hosting")? "selected='selected' ":"") + ">Web Hosting</option>" + 
		"<option value='website' "+ ((device_service=="website")? "selected='selected' ":"") + ">Website</option>" + 
		"<option value='wifi_access_point_ar' "+ ((device_service=="wifi_access_point_ar")? "selected='selected' ":"") + ">Wi-Fi Access Point AP</option>" + 
		"<option value='other' "+ ((device_service=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option>" + 
	    "</select></td>";

	row.innerHTML="<td><span style='color:black;'>Service Name : </span></td>" + 
		"<td><select name='hwdpassword[device_service][]' style='width:70%;' ><option value=''>&lt;Select&gt;</option>" + selSvcStrOption +
		"<td><span style='color:black;'>Other :</span></td><td><input name='hwdpassword[other][]' value='" + other + "' type='text' style='width:70%;' ></td>";

	var row = table.insertRow(-1);
	row.innerHTML = "<td colspan='2' align='center'>Hardware&nbsp;&nbsp;" +
		"<input type='radio' name='hwdpassword[type][]' id='hardwareInput' value='1' " +
		(type == '1' ? 'checked="checked"' : '') + "/>&nbsp;&nbsp;&nbsp;&nbsp;" +
		"Software&nbsp;&nbsp;<input type='radio' name='hwdpassword[type][]' id='softwareInput' value='0' " +
		(type == '0' ? 'checked="checked"' : '') + "/></td>" +
		"<td></td>";


		

	var row=table.insertRow(-1);

	row.innerHTML="<td><span style='color:black;'>Description : </span></td><td><input name='hwdpassword[description][]' value='" + description + "' type='text' style='width:70%;' ></td>" + 
			"<td><span style='color:black;'>Brand :</span></td><td><input name='hwdpassword[brand][]' value='" + brand + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);

	row.innerHTML="<td><span style='color:black;'>Model : </span></td><td><input name='hwdpassword[model][]' value='" + model + "' type='text' style='width:70%;' ></td>" + 
		"<td><span style='color:black;'>Serial Number :</span></td><td><input name='hwdpassword[serial_number][]' value='" + serial_number + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);

	row.innerHTML="<td><span style='color:black;'>IP Address : </span></td><td><input name='hwdpassword[ip_address][]' value='" + ip_address + "' type='text' style='width:70%;' ></td>" + 
		"<td><span style='color:black;'>MAC Address :</span></td><td><input name='hwdpassword[mac_address][]' value='" + mac_address + "' type='text' style='width:70%;' ></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td colspan='2'><b>Device Login Details</b></td><td colspan='2'><b>Service Authentication Details</b></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>URL/IP Address : </span></td><td><input name='hwdpassword[device_url_ip_address][]' value='" + device_url_ip_address + "' type='text' style='width:70%;' ></td>" + 
					"<td><span style='color:black;'>URL/IP Address :</span></td><td><input name='hwdpassword[service_url_ip_address][]' value='" + service_url_ip_address + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Username : </span></td><td><input name='hwdpassword[device_username][]' value='" + device_username + "' type='text' style='width:70%;' ></td>" + 
					"<td><span style='color:black;'>Username :</span></td><td><input name='hwdpassword[service_username][]' value='" + service_username + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Password : </span></td><td><input name='hwdpassword[device_password][]' value='" + device_password + "' type='text' style='width:70%;' ></td>" + 
				"<td><span style='color:black;'>Password :</span></td><td><input name='hwdpassword[service_password][]' value='" + service_password + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td colspan='2'><b>Device Login Details</b></td><td colspan='2'><b>Service Authentication Details</b></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>SSID : </span></td><td><input name='hwdpassword[service1_ssid][]' value='" + service1_ssid + "' type='text' style='width:70%;' ></td>" + 
					"<td><span style='color:black;'>SSID :</span></td><td><input name='hwdpassword[service2_ssid][]' value='" + service2_ssid + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Password : </span></td><td><input name='hwdpassword[service1_password][]' value='" + service1_password + "' type='text' style='width:70%;' ></td>" + 
					"<td><span style='color:black;'>Password :</span></td><td><input name='hwdpassword[service2_password][]' value='" + service2_password + "' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='4'><hr/></td>";
}

function addHardwarePassword()
{
	var table=document.getElementById("myTable8");

	var row=table.insertRow(-1);
	row.innerHTML="<th align='left' colspan='2'><b>Product/Service Details</b></th><th></th><th></th><th></th>";

	var row=table.insertRow(-1);
	var selSvcStrOption = 
		"<option value='desktop_computer'>Desktop Computer</option>" + 
		"<option value='domain_name'>Domain Name</option>" + 
		"<option value='ip_handset'>IP Handset</option>" + 
		"<option value='mobile_phone'>Mobile Phone</option>" + 
		"<option value='modem_router'>Modem/Router</option>" + 
		"<option value='network_switch'>Network Switch</option>" + 
		"<option value='notebook'>Notebook</option>" + 
		"<option value='operating_system'>Operating System</option>" + 
		"<option value='photocopier'>Photocopier</option>" + 
		"<option value='sercurity_camera_nvr'>Security Camera NVR</option>" + 
		"<option value='server_computer'>Server Computer</option>" + 
		"<option value='software'>Software</option>" + 
		"<option value='tablet'>Tablet</option>" + 
		"<option value='web_hosting'>Web Hosting</option>" + 
		"<option value='website'>Website</option>" + 
		"<option value='wifi_access_point_ar'>Wi-Fi Access Point AP</option>" + 
		"<option value='other'>&lt;Other&gt;</option>" + 
	    "</select></td>";

	row.innerHTML="<td><span style='color:black;'>Service Name : </span></td>" + 
	               "<td><select name='hwdpassword[device_service][]' style='width:70%;' ><option value=''>&lt;Select&gt;</option>" + selSvcStrOption +
	               "<td><span style='color:black;'>Other :</span></td><td><input name='hwdpassword[other][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML = "<td colspan='2' align='center'>Hardware&nbsp;&nbsp;<input type='radio' name='hwdpassword[type][]' id='textInput' value='1'/>&nbsp;&nbsp;&nbsp;&nbsp;" +
		"Softwareware&nbsp;&nbsp;<input type='radio' name='hwdpassword[type][]' id='textInput' value='0'/></td>" +
		"<td></td>";
			   

	var row=table.insertRow(-1);
	
	row.innerHTML="<td><span style='color:black;'>Description : </span></td><td><input name='hwdpassword[description][]' type='text' style='width:70%;' ></td>" + 
	              "<td><span style='color:black;'>Brand :</span></td><td><input name='hwdpassword[brand][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);

	row.innerHTML="<td><span style='color:black;'>Model : </span></td><td><input name='hwdpassword[model][]' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>Serial Number :</span></td><td><input name='hwdpassword[serial_number][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);

	row.innerHTML="<td><span style='color:black;'>IP Address : </span></td><td><input name='hwdpassword[ip_address][]' type='text' style='width:70%;' ></td>" + 
	"<td><span style='color:black;'>MAC Address :</span></td><td><input name='hwdpassword[mac_address][]' type='text' style='width:70%;' ></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td colspan='2'><b>Device Login Details</b></td><td colspan='2'><b>Service Authentication Details</b></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>URL/IP Address : </span></td><td><input name='hwdpassword[device_url_ip_address][]' type='text' style='width:70%;' ></td>" + 
	              "<td><span style='color:black;'>URL/IP Address :</span></td><td><input name='hwdpassword[service_url_ip_address][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Username : </span></td><td><input name='hwdpassword[device_username][]' type='text' style='width:70%;' ></td>" + 
	              "<td><span style='color:black;'>Username :</span></td><td><input name='hwdpassword[service_username][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Password : </span></td><td><input name='hwdpassword[device_password][]' type='text' style='width:70%;' ></td>" + 
				"<td><span style='color:black;'>Password :</span></td><td><input name='hwdpassword[service_password][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td colspan='2'><b>Device Login Details</b></td><td colspan='2'><b>Service Authentication Details</b></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>SSID : </span></td><td><input name='hwdpassword[service1_ssid][]' type='text' style='width:70%;' ></td>" + 
	              "<td><span style='color:black;'>SSID :</span></td><td><input name='hwdpassword[service2_ssid][]' type='text' style='width:70%;' ></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td><span style='color:black;'>Password : </span></td><td><input name='hwdpassword[service1_password][]' type='text' style='width:70%;' ></td>" + 
	              "<td><span style='color:black;'>Password :</span></td><td><input name='hwdpassword[service2_password][]' type='text' style='width:70%;' ></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='4'><hr/></td>";
	
}

function displayHardwareMobile(mobile_service_number, mobile_device_type, mobile_network, mobile_provider, mobile_service_id_ref, mobile_plan, mobile_data_allowance,
	mobile_cost, mobile_user_description, mobile_contract_type, mobile_service_type, mobile_share_data, mobile_comments, mobile_date_order, mobile_date_activation,
	mobile_date_cancel, mobile_order_ref, mobile_activation_ref, mobile_cancel_ref) {

	var table=document.getElementById("myTable9");

	var selNetworkOptions = "<option value='' "+ ((mobile_network=="")? "selected='selected' ":"") + ">&lt;Select&gt;</option>" +
		"<option value='telstra' "+ ((mobile_network=="telstra")? "selected='selected' ":"") + ">Telstra</option>" +
		"<option value='optus' "+ ((mobile_network=="optus")? "selected='selected' ":"") + ">Optus</option>" +
		"<option value='vodafone' "+ ((mobile_network=="vodafone")? "selected='selected' ":"") + ">Vodafone </option>" +
		"<option value='other' "+ ((mobile_network=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option>" +
		"</select></td>";

	var selProviderOptions = "<option value='' "+ ((mobile_provider=="")? "selected='selected' ":"") + ">&lt;Select&gt;</option>" + 
		"<option value='pwn' "+ ((mobile_provider=="pwn")? "selected='selected' ":"") + ">PWN</option>" + 
		"<option value='burosery' "+ ((mobile_provider=="burosery")? "selected='selected' ":"") + ">BuroSery</option>" + 
		"<option value='tiab' "+ ((mobile_provider=="tiab")? "selected='selected' ":"") + ">TIAB </option>" + 
		"<option value='other' "+ ((mobile_provider=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option></select></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td align='center'><p class='mobile_tab'>Service Number</p><input name='mobilehwd[mobile_service_number][]' id='mobile_service_number' value='" + mobile_service_number + "' type='text' style='width:80%;'></td>" + 
		"<td align='center'><p class='mobile_tab'>Device Type</p><input name='mobilehwd[mobile_device_type][]' id='mobile_device_type' value='" + mobile_device_type + "' type='text' style='width:80%;'></td>" + 
		"<td align='center' width='16.7%'><p class='mobile_tab'>Carrier Network</p><select name='mobilehwd[mobile_network][]' id='mobile_network' type='text' style='width:88%;'>" + selNetworkOptions +  
		"<td align='center' width='16.7%'><p class='mobile_tab'>Provider</p><select name='mobilehwd[mobile_provider][]' id='mobile_provider' type='text' style='width:88%;'>" + selProviderOptions +
	  	"<td align='center'><p class='mobile_tab'>Service ID/Ref</p><input name='mobilehwd[mobile_service_id_ref][]' id='mobile_service_id_ref' value='" + mobile_service_id_ref + "' type='text' style='width:80%;'></td>" +
  		"<td align='center'><p class='mobile_tab'>Plan Name</p><input name='mobilehwd[mobile_plan][]' id='mobile_plan' value='" + mobile_plan + "' type='text' style='width:80%;'></td>";

	var selContractOptions = "<option value='' "+ ((mobile_contract_type=="")? "selected='selected' ":"") + ">&lt;Select&gt;</option>" +
		"<option value='m2m' "+ ((mobile_contract_type=="m2m")? "selected='selected' ":"") + ">M2M</option>" +
		"<option value='12' "+ ((mobile_contract_type=="12")? "selected='selected' ":"") + ">12 Months</option>" +
		"<option value='24' "+ ((mobile_contract_type=="24")? "selected='selected' ":"") + ">24 Months</option>" +
		"<option value='36' "+ ((mobile_contract_type=="36")? "selected='selected' ":"") + ">36 Months</option>" +
		"<option value='48' "+ ((mobile_contract_type=="48")? "selected='selected' ":"") + ">48 Months</option>" +
		"<option value='60' "+ ((mobile_contract_type=="60")? "selected='selected' ":"") + ">60 Months</option>" +
		"<option value='other' "+ ((mobile_contract_type=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option></select></td>";
	
	var selServiceTypeOptions = "<option value='' "+ ((mobile_service_type=="")? "selected='selected' ":"") + ">&lt;Select&gt;</option>" +
	"<option value='voice' "+ ((mobile_service_type=="voice")? "selected='selected' ":"") + ">Voice</option>" +
	"<option value='bnb' "+ ((mobile_service_type=="bnb")? "selected='selected' ":"") + ">BMB</option>" +
	"<option value='other' "+ ((mobile_service_type=="other")? "selected='selected' ":"") + ">&lt;Other&gt;</option></select></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td align='center' colspan='2'><p class='mobile_tab'>User Name/Description</p><input name='mobilehwd[mobile_user_description][]' id='mobile_user_description' value='" + mobile_user_description + "' type='text' style='width:80%;'></td>" +
		"<td align='center'><p class='mobile_tab'>Data Allowance</p><input name='mobilehwd[mobile_data_allowance][]' id='mobile_data_allowance' value='" + mobile_data_allowance + "' type='text' style='width:80%;'</td>" +
		"<td align='center'><p class='mobile_tab'>Cost Per Month</p><input name='mobilehwd[mobile_cost][]' id='mobile_cost' value='" + mobile_cost + "' type='text' style='width:80%;'></td>" +
		"<td align='center'><p class='mobile_tab'>Contract Term</p><select name='mobilehwd[mobile_contract_type][]' id='mobile_contract_type' type='text' style='width:88%;'>" + selContractOptions +
		"<td align='center'><p class='mobile_tab'>Service Type</p><select name='mobilehwd[mobile_service_type][]' id='mobile_service_type' type='text' style='width:88%;'>" + selServiceTypeOptions;
		  
	var row=table.insertRow(-1);
	row.innerHTML = "<td align='center'><p class='mobile_tab'>Shared Data Pool</p>Yes&nbsp;&nbsp;<input type='radio' name='mobilehwd[mobile_share_data][]' id='textInput' value='1' " +
		(mobile_share_data == '1' ? 'checked="checked"' : '') + "/>&nbsp;&nbsp;&nbsp;&nbsp;" +
		"No&nbsp;&nbsp;<input type='radio' name='mobilehwd[mobile_share_data][]' value='' " +
		(mobile_share_data == '0' ? 'checked="checked"' : '') + " id='textInput'/></td>" +
		"<td align='center' colspan='5'><p class='mobile_tab'>Comments</p><input name='mobilehwd[mobile_comments][]' id='mobile_comments' value='" + mobile_comments + "' type='text' style='width:80%;'></td>";

	var row = table.insertRow(-1);
	row.innerHTML = "<td align='center' colspan='2'><p class='mobile_tab'>Date Ordered</p><input name='mobilehwd[mobile_date_order][]' id='mobile_date_order' value='" + mobile_date_order + "' type='date' style='width:80%;'></td>" +
		"<td align='center' colspan='2'><p class='mobile_tab'>Date Activation</p><input name='mobilehwd[mobile_date_activation][]' id='mobile_date_activation' value='" + mobile_date_activation + "' type='date' style='width:80%;'></td>" +
		"<td align='center' colspan='2'><p class='mobile_tab'>Date Cancelled</p><input name='mobilehwd[mobile_date_cancel][]' id='mobile_date_cancel' value='" + mobile_date_cancel + "' type='date' style='width:80%;'></td>";

	var row = table.insertRow(-1);
	row.innerHTML = "<td align='center' colspan='2'><p class='mobile_tab'>Reference</p><input name='mobilehwd[mobile_order_ref][]' id='mobile_order_ref' value='" + mobile_order_ref + "' type='text' style='width:80%;'></td>" +
	"<td align='center' colspan='2'><p class='mobile_tab'>Reference</p><input name='mobilehwd[mobile_activation_ref][]' id='mobile_activation_ref' value='" + mobile_activation_ref + "' type='text' style='width:80%;'></td>" +
	"<td align='center' colspan='2'><p class='mobile_tab'>Reference</p><input name='mobilehwd[mobile_cancel_ref][]' id='mobile_cancel_ref' value='" + mobile_cancel_ref + "' type='text' style='width:80%;'></td>";

	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='6'><hr/></td>";
}

function addHardwareMobile() {

	var table=document.getElementById("myTable9");

	var selNetworkOptions = "<option value=''>&lt;Select&gt;</option>" +
		"<option value='telstra'>Telstra</option>" +
		"<option value='optus'>Optus</option>" +
		"<option value='vodafone'>Vodafone </option>" +
		"<option value='other'>&lt;Other&gt;</option>" +
		"</select></td>";

	var selProviderOptions = "<option value=''>&lt;Select&gt;</option>" + 
		"<option value='pwn'>PWN</option>" + 
		"<option value='burosery'>BuroSery</option>" + 
		"<option value='tiab'>TIAB </option>" + 
		"<option value='other'>&lt;Other&gt;</option></select></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td align='center'><p class='mobile_tab'>Service Number</p><input name='mobilehwd[mobile_service_number][]' id='mobile_service_number' type='text' style='width:80%;'></td>" + 
		"<td align='center'><p class='mobile_tab'>Device Type</p><input name='mobilehwd[mobile_device_type][]' id='mobile_device_type' type='text' style='width:80%;'></td>" + 
		"<td align='center' width='16.7%'><p class='mobile_tab'>Carrier Network</p><select name='mobilehwd[mobile_network][]' id='mobile_network' type='text' style='width:88%;'>" + selNetworkOptions +  
		"<td align='center' width='16.7%'><p class='mobile_tab'>Provider</p><select name='mobilehwd[mobile_provider][]' id='mobile_provider' type='text' style='width:88%;'>" + selProviderOptions +
	  	"<td align='center'><p class='mobile_tab'>Service ID/Ref</p><input name='mobilehwd[mobile_service_id_ref][]' id='mobile_service_id_ref' type='text' style='width:80%;'></td>" +
  		"<td align='center'><p class='mobile_tab'>Plan Name</p><input name='mobilehwd[mobile_plan][]' id='mobile_plan' type='text' style='width:80%;'></td>";

	var selContractOptions = "<option value=''>&lt;Select&gt;</option>" +
		"<option value='m2m'>M2M</option>" +
		"<option value='12'>12 Months</option>" +
		"<option value='24'>24 Months</option>" +
		"<option value='36'>36 Months</option>" +
		"<option value='48'>48 Months</option>" +
		"<option value='60'>60 Months</option>" +
		"<option value='other'>&lt;Other&gt;</option></select></td>";
	
	var selServiceTypeOptions = "<option value=''>&lt;Select&gt;</option>" +
	"<option value='voice'>Voice</option>" +
	"<option value='bnb'>BMB</option>" +
	"<option value='other'>&lt;Other&gt;</option></select></td>";

	var row=table.insertRow(-1);
	row.innerHTML="<td align='center' colspan='2'><p class='mobile_tab'>User Name/Description</p><input name='mobilehwd[mobile_user_description][]' id='mobile_user_description' type='text' style='width:80%;'></td>" +
		"<td align='center'><p class='mobile_tab'>Data Allowance</p><input name='mobilehwd[mobile_data_allowance][]' id='mobile_data_allowance' type='text' style='width:80%;'</td>" +
		"<td align='center'><p class='mobile_tab'>Cost Per Month</p><input name='mobilehwd[mobile_cost][]' id='mobile_cost' type='text' style='width:80%;'></td>" +
		"<td align='center'><p class='mobile_tab'>Contract Term</p><select name='mobilehwd[mobile_contract_type][]' id='mobile_contract_type' type='text' style='width:88%;'>" + selContractOptions +
		"<td align='center'><p class='mobile_tab'>Service Type</p><select name='mobilehwd[mobile_service_type][]' id='mobile_service_type' type='text' style='width:88%;'>" + selServiceTypeOptions;
		  
	var row=table.insertRow(-1);
	row.innerHTML = "<td align='center'><p class='mobile_tab'>Shared Data Pool</p>Yes&nbsp;&nbsp;<input type='radio' name='mobilehwd[mobile_share_data][]' id='textInput' value='1'/>&nbsp;&nbsp;&nbsp;&nbsp;" +
		"No&nbsp;&nbsp;<input type='radio' name='mobilehwd[mobile_share_data][]' id='textInput' value='0'/></td>" +
		"<td align='center' colspan='5'><p class='mobile_tab'>Comments</p><input name='mobilehwd[mobile_comments][]' id='mobile_comments' type='text' style='width:80%;'></td>";

	var row = table.insertRow(-1);
	row.innerHTML = "<td align='center' colspan='2'><p class='mobile_tab'>Date Ordered</p><input name='mobilehwd[mobile_date_order][]' id='mobile_date_order' type='date' style='width:80%;'></td>" +
		"<td align='center' colspan='2'><p class='mobile_tab'>Date Activation</p><input name='mobilehwd[mobile_date_activation][]' id='mobile_date_activation' type='date' style='width:80%;'></td>" +
		"<td align='center' colspan='2'><p class='mobile_tab'>Date Cancelled</p><input name='mobilehwd[mobile_date_cancel][]' id='mobile_date_cancel' type='date' style='width:80%;'></td>";

	var row = table.insertRow(-1);
	row.innerHTML = "<td align='center' colspan='2'><p class='mobile_tab'>Reference</p><input name='mobilehwd[mobile_order_ref][]' id='mobile_order_ref' type='text' style='width:80%;'></td>" +
	"<td align='center' colspan='2'><p class='mobile_tab'>Reference</p><input name='mobilehwd[mobile_activation_ref][]' id='mobile_activation_ref' type='text' style='width:80%;'></td>" +
	"<td align='center' colspan='2'><p class='mobile_tab'>Reference</p><input name='mobilehwd[mobile_cancel_ref][]' id='mobile_cancel_ref' type='text' style='width:80%;'></td>";

	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='6'><hr/></td>";
}

function displayContacts(person, position, department, phone, mobile, email)
{
	var table=document.getElementById("myTable4");
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160' style='border:0px'>&nbsp;&nbsp;&nbsp;&nbsp;Contact Person :</td><td style='border:0px;border-right:1px solid #ddd;'><input type='text' size='50' value='" + person + "' name='cont[person][]' style='width:92%;'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160' style='border:0px'>&nbsp;&nbsp;&nbsp;&nbsp;Position :</td><td style='border:0px;border-right:1px solid #ddd;'><input type='text' size='20'  value='" + position + "' name='cont[position][]'>&nbsp;&nbsp;Department :  <input type='text' size='20'  value='"+ department + "' name='cont[department][]' style='width:34%;'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160' style='border:0px'>&nbsp;&nbsp;&nbsp;&nbsp;Phone Number :</td><td style='border:0px;border-right:1px solid #ddd;'><input type='text' size='20'  value='" + phone + "' name='cont[phone][]'>&nbsp;&nbsp;Mobile :  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' size='20'  value='"+mobile+"' name='cont[mobile][]' style='width:34%;'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160' style='border-bottom:2px solid #0094B3;'>&nbsp;&nbsp;&nbsp;&nbsp;Email Address :</td><td style='border-bottom:2px solid #0094B3;border-right:1px solid #ddd;'><input type='text' size='50'  value='"+ email + "' name='cont[email][]' style='width:92%;'></td>";
}

function addContact()
{
	var table=document.getElementById("myTable4");
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>&nbsp;&nbsp;&nbsp;&nbsp;Contact Person :</td><td style='border-right:1px solid #ddd;'><input type='text' size='50' name='cont[person][]' style='width:92%;'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>&nbsp;&nbsp;&nbsp;&nbsp;Position :</td><td style='border-right:1px solid #ddd;'><input type='text' size='20' name='cont[position][]'>&nbsp;&nbsp;&nbsp;Department :  <input type='text' size='20' name='cont[department][]' style='width:36%;'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>&nbsp;&nbsp;&nbsp;&nbsp;Phone Number :</td><td style='border-right:1px solid #ddd;'><input type='text' size='20' name='cont[phone][]'>&nbsp;&nbsp;&nbsp;Mobile :  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' size='20' name='cont[mobile][]' style='width:36%;'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'style='border-bottom:2px solid #0094B3;'>&nbsp;&nbsp;&nbsp;&nbsp;Email Address :</td><td style='border-bottom:2px solid #0094B3;    border-right: 1px solid #ddd;'><input type='text' size='50' name='cont[email][]' style='width:92%;'></td>";

}

function displayHardwarePC(devtype, other, owner, location, userName, pwd, ipaddr, hosting, port)
{
	var table=document.getElementById("myTable5");
	
	var row=table.insertRow(-1);
	var selDevStrOption = 
		"<option value='dev_server'" + ((devtype=="dev_server")? "selected='selected' ":"") + ">Server</option>" + 
		"<option value='dev_workstation'" + ((devtype=="dev_workstation")? "selected='selected' ":"") + ">Workstation</option>" + 
		"<option value='dev_notebook'" + ((devtype=="dev_notebook")? "selected='selected' ":"") + ">Notebook</option>" + 
		"<option value='other'>&lt;Other&gt;</option>" + 
	    "</select></td>";
	row.innerHTML="<td>Type of Device : </td>" + 
	    "<td><select name='hwdpc[devtype][]' style='width:120px;' ><option value=''>&lt;Select&gt;</option>" + selDevStrOption;
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Other :</td><td><input type='text' size='50'  value='" + other + "' name='hwdpc[other][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Device Owner :</td><td><input type='text' size='50'  value='" + owner + "' name='hwdpc[owner][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Device Location :</td><td><input type='text' size='50'  value='" + location + "' name='hwdpc[location][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>User Name :</td><td><input type='text' size='50'  value='" + userName + "' name='hwdpc[user][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Password :</td><td><input type='text' size='50'  value='" + pwd + "' name='hwdpc[pwd][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>IP Address :</td><td><input type='text' size='50'  value='" + ipaddr + "' name='hwdpc[ipaddr][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Hosting :</td><td><input type='text' size='50'  value='" + hosting + "' name='hwdpc[hosting][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Port Number :</td><td><input type='text' size='50'  value='" + port + "' name='hwdpc[port][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='2'><hr/></td>";
	
}

function addHardwarePC()
{
var table=document.getElementById("myTable5");
	
	var row=table.insertRow(-1);
	var selDevStrOption = 
		"<option value='dev_server'>Server</option>" + 
		"<option value='dev_workstation'>Workstation</option>" + 
		"<option value='dev_notebook'>Notebook</option>" + 
		"<option value='other'>&lt;Other&gt;</option>" + 
	    "</select></td>";
	
	row.innerHTML="<td>Type of Device : </td>" + 
	    "<td><select name='hwdpc[devtype][]' style='width:120px;' ><option value=''>&lt;Select&gt;</option>" + selDevStrOption;
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Other :</td><td><input type='text' size='50'  value='' name='hwdpc[other][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Device Owner :</td><td><input type='text' size='50'  value='' name='hwdpc[owner][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Device Location :</td><td><input type='text' size='50'  value='' name='hwdpc[location][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>User Name :</td><td><input type='text' size='50'  value='' name='hwdpc[user][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Password :</td><td><input type='text' size='50'  value='' name='hwdpc[pwd][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>IP Address :</td><td><input type='text' size='50'  value='' name='hwdpc[ipaddr][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Hosting :</td><td><input type='text' size='50'  value='' name='hwdpc[hosting][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Port Number :</td><td><input type='text' size='50'  value='' name='hwdpc[port][]'></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='2'><hr/></td>";

}

function displayNotes(notes)
{
	var outputArray = notes.split(/\s+/);
	var table=document.getElementById("myTable6");
	
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Notes :</td><td><textarea name='notes[contents][]' style='width:95%' rows='5'>" + outputArray.join("\n") + "</textarea></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='2'><hr/></td>";
	
}

function addNotes()
{
	var table=document.getElementById("myTable6");
		
	var row=table.insertRow(-1);
	row.innerHTML="<td width='160'>Notes :</td><td><textarea name='notes[contents][]' style='width:95%' rows='5'></textarea></td>";
	
	var row=table.insertRow(-1);
	row.innerHTML= "<td colspan='2'><hr/></td>";

}
// end add hong