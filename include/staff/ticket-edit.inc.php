<?php
if (!defined('OSTSCPINC')
        || !$ticket
        || !($ticket->checkStaffPerm($thisstaff, Ticket::PERM_EDIT)))
    die('Access Denied');

$info=Format::htmlchars(($errors && $_POST)?$_POST:$ticket->getUpdateInfo(), true);
 //print_r($info);
if ($_POST)
    // Reformat duedate to the display standard (but don't convert to local
    // timezone)
    $info['duedate'] = Format::date(strtotime($info['duedate']), false, false, 'UTC');
?>
<form action="tickets.php?id=<?php echo $ticket->getId(); ?>&a=edit" method="post" class="save"  enctype="multipart/form-data">
    <?php csrf_token(); ?>
    <input type="hidden" name="do" value="update">
    <input type="hidden" name="a" value="edit">
    <input type="hidden" name="id" value="<?php echo $ticket->getId(); ?>">
    <div style="margin-bottom:20px; padding-top:5px;">
        <div class="pull-left flush-left">
            <h2><?php echo sprintf(__('Update Ticket #%s'),$ticket->getNumber());?></h2>
        </div>
    </div>
    <table class="form_table" width="940" border="0" cellspacing="0" cellpadding="2">
    <tbody>
      <tr>
        <th colspan="2">
          <strong><?php echo __('User Information'); ?></strong>:
        </th>
      </tr>
      <?php
        if ($user) { ?>
      <tr>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('User'); ?>:</td>
        <td>
          <div id="user-info">
            <input type="hidden" name="uid" id="uid" value="<?php echo $user->getId(); ?>" />
            <a href="#" onclick="javascript:
                $.userLookup('ajax.php/users/<?php echo $user->getId(); ?>/edit',
                        function (user) {
                            $('#user-name').text(user.name);
                            $('#user-email').text(user.email);
                        });
                return false;
                "><i class="icon-user"></i>
              <span id="user-name"><?php echo Format::htmlchars($user->getName()); ?></span>
              &lt;<span id="user-email"><?php echo $user->getEmail(); ?></span>&gt;
            </a>
            <a class="action-button" style="overflow:inherit" href="#" onclick="javascript:
                        $.userLookup('ajax.php/users/select/'+$('input#uid').val(),
                            function(user) {
                                $('input#uid').val(user.id);
                                $('#user-name').text(user.name);
                                $('#user-email').text('<'+user.email+'>');
                        });
                        return false;
                    "><i class="icon-edit"></i> <?php echo __('Change'); ?></a>
          </div>
        </td>
      </tr>
      <?php
            } else { //Fallback: Just ask for email and name
              ?>
      <tr>
        <td width="160" class="required">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Company:
        </td>
        <td>

          <input type="text" size="50" name="company" id="company" class="typeahead"
            value="<?php echo $info['company']; ?>" autocomplete="off" autocorrect="off" autocapitalize="off">
          &nbsp;<span class="error">*&nbsp;<?php echo $errors['company']; ?></span>
        </td>
      </tr>
      <tr>
        <td width="160" class="required">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email:
        </td>
        <td>

          <input type="text" size="50" name="email" id="email" class="typeahead" value="<?php echo $info['email']; ?>"
            autocomplete="off" autocorrect="off" autocapitalize="off">
          &nbsp;<span class="error">*&nbsp;<?php echo $errors['email']; ?></span>
          <?php 
            if($cfg->notifyONNewStaffTicket()) { ?>
          &nbsp;&nbsp;&nbsp;
          <input type="checkbox" name="alertuser"
            <?php echo (!$errors || $info['alertuser'])? 'checked="checked"': ''; ?>>Send alert to user.
          <?php 
             } ?>
        </td>
      </tr>
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email BCC:
        </td>
        <td>

          <input type="text" size="50" name="email2" id="email2" class="typeahead"
            value="<?php echo $info['email2']; ?>" autocomplete="off" autocorrect="off" autocapitalize="off">
          &nbsp;<span class="error">&nbsp;<?php echo $errors['email2']; ?></span>
          <?php 
            if($cfg->notifyONNewStaffTicket()) { ?>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <input type="checkbox" name="alertuser2"
            <?php echo (!$errors || $info['alertuser2'])? 'checked="checked"': ''; ?>>Send alert to user.
          <?php 
             } ?>
        </td>
      </tr>
      <!-- end coderXO mod -->

      <tr>
        <td width="160" class="required">
          <!-- start coderXO mod --> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Contact Person'); ?>:
          <!-- end coderXO mod -->
        </td>
        <td>
          <span style="display:inline-block;">
            <input type="text" size=45 name="name" id="user-name" value="<?php echo Format::htmlchars($ticket->getName()); ?>" /> </span>
          <font class="error">* <?php echo $errors['name']; ?></font>
        </td>
      </tr>
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Phone Number:
        </td>
        <td>
          <input type="text" size="20" name="phone" id="phone" value="<?php echo $info['phone']; ?>">
          &nbsp;<span class="error">&nbsp;<?php echo $errors['phone']; ?></span>
          Ext <input type="text" size="6" name="phone_ext" id="phone_ext" value="<?php echo $info['phone_ext']; ?>">
          &nbsp;<span class="error">&nbsp;<?php echo $errors['phone_ext']; ?></span>
        </td>
      </tr>
      <!-- start coderXO mod -->
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mobile:
        </td>
        <td>
          <input type="text" size="20" name="mobile" id="mobile" value="<?php echo $info['mobile']; ?>">
        </td>
      </tr>
      <tr>
        <td width="160" valign="top">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Site Address:
        </td>
        <td>

          <input type="text" size="50" name="address" id="address" value="<?php echo $info['address']; ?>">
          &nbsp;
          <br />
          <input type="text" size="50" name="address2" id="address2" value="<?php echo $info['address2']; ?>">
          &nbsp;
        </td>
      </tr>
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Suburb:
        </td>
        <td>

          <input type="text" size="20" name="suburb" id="suburb" value="<?php echo $info['suburb']; ?>">
          &nbsp;
          &nbsp;
          &nbsp;
          State:
          <select name="state" id="state">
            <option value=""></option>
            <option value="ACT" <?php echo $info['state'] == 'ACT' ? "selected=\"selected\"":""; ?>>ACT</option>
            <option value="NSW" <?php echo $info['state'] == 'NSW' ? "selected=\"selected\"":""; ?>>NSW</option>
            <option value="NT" <?php echo $info['state'] == 'NT' ? "selected=\"selected\"":""; ?>>NT</option>
            <option value="SA" <?php echo $info['state'] == 'SA' ? "selected=\"selected\"":""; ?>>SA</option>
            <option value="TAS" <?php echo $info['state'] == 'TAS' ? "selected=\"selected\"":""; ?>>TAS</option>
            <option value="VIC" <?php echo $info['state'] == 'VIC' ? "selected=\"selected\"":""; ?>>VIC</option>
            <option value="QLD" <?php echo $info['state'] == 'QLD' ? "selected=\"selected\"":""; ?>>QLD</option>
            <option value="WA" <?php echo $info['state'] == 'WA' ? "selected=\"selected\"":""; ?>>WA</option>
          </select>
          &nbsp;
          &nbsp;

          Postcode: <input type="text" size="5" name="postcode" id="postcode" value="<?php echo $info['postcode']; ?>">
          &nbsp;
        </td>
      </tr>
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VIP Support:
        </td>
        <td>

          <select name="vip" id="vip">
            <option value="No">No</option>
            <option value="Yes" <?php echo $info['vip'] == 'Yes' ? "selected=\"selected\"":""; ?>>Yes</option>
          </select>
          &nbsp;
          &nbsp;

          Contract Number: <input type="text" size="10" name="contract" id="contract"
            value="<?php echo $info['contract']; ?>">
          &nbsp;
        </td>
      </tr>
      <!-- end coderXO mod -->
      <?php
        } ?>
      </tr>
      <?php
        if ($cfg->notifyONNewStaffTicket()) {
         ?>
      <tr>
        <td width="160">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Ticket Notice'); ?>:</td>
        <td>
          <input type="checkbox" name="alertuser"
            <?php echo (!$errors || $info['alertuser'])? 'checked="checked"': ''; ?>><?php
                echo __('Send alert to user.'); ?>
        </td>
      </tr>
      <?php
        } ?>
    </tbody>
    <tbody>
      <tr>
        <th colspan="2">
          <em><strong><?php echo __('Ticket Information and Options');?></strong>:</em>
        </th>
      </tr>
      <tr>
        <td width="160" class="required">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Ticket Source');?>:
        </td>
        <td>
          <select name="source">
            <?php
                    $source = $info['source'] ?: 'Phone';
                    $sources = Ticket::getSources();
                    unset($sources['Web'], $sources['API']);
                    foreach ($sources as $k => $v)
                        echo sprintf('<option value="%s" %s>%s</option>',
                                $k,
                                ($source == $k ) ? 'selected="selected"' : '',
                                $v);
                    ?>
          </select>
          &nbsp;<font class="error"><b>*</b>&nbsp;<?php echo $errors['source']; ?></font>
          Other:&nbsp;<input type="text" size="20" name="source_other" id="source_other"
            value="<?php echo $info['source_other']; ?>">
        </td>
      </tr>
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Department'); ?>:
        </td>
        <td>
          <select name="deptId">
            <option value="" selected>&mdash; <?php echo __('Select Department'); ?>&mdash;</option>
            <?php
                    if($depts=Dept::getDepartments()) {
                        foreach($depts as $id =>$name) {
                            echo sprintf('<option value="%d" %s>%s</option>',
                                    $id, ($info['deptId']==$id)?'selected="selected"':'',$name);
                        }
                    }
                    ?>
          </select>
          &nbsp;<font class="error"><?php echo $errors['deptId']; ?></font>
        </td>
      </tr>
      <tr>
        <td width="160" class="required">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Help Topic'); ?>:
        </td>
        <td>
          <select name="topicId" onchange="javascript:
                        var data = $(':input[name]', '#dynamic-form').serialize();
                        $.ajax(
                          'ajax.php/form/help-topic/' + this.value,
                          {
                            data: data,
                            dataType: 'json',
                            success: function(json) {
                              $('#dynamic-form').empty().append(json.html);
                              $(document.head).append(json.media);
                            }
                          });">
            <?php
                    if ($topics=Topic::getHelpTopics()) {
                        if (count($topics) == 1)
                            $selected = 'selected="selected"';
                        else { ?>
            <option value="" selected>&mdash; <?php echo __('Select Help Topic'); ?> &mdash;</option>
            <?php }
                        foreach($topics as $id =>$name) {
                            echo sprintf('<option value="%d" %s %s>%s</option>',
                                $id, ($info['topicId']==$id)?'selected="selected"':'',
                                $selected, $name);
                        }
                        if (count($topics) == 1 && !$form) {
                            if (($T = Topic::lookup($id)))
                                $form =  $T->getForm();
                        }
                    }
                    ?>
          </select>
          &nbsp;<font class="error"><b>*</b>&nbsp;<?php echo $errors['topicId']; ?></font>
        </td>
      </tr>
      <!-- <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Priority');?>:
        </td>
        <td>
          <select name="priorityId">
            <option value="0" selected>&mdash; System Default &mdash;</option>
            <?php
                    if($priorities=Priority::getPriorities()) {
                        foreach($priorities as $id =>$name) {
                            echo sprintf('<option value="%d" %s>%s</option>',
                                    $id, ($info['priorityId']==$id)?'selected="selected"':'',$name);
                        }
                    }
                    ?>
          </select>
          &nbsp;<font class="error">&nbsp;<?php echo $errors['priorityId']; ?></font>
        </td>
      </tr> -->
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('SLA Plan');?>:
        </td>
        <td>
          <select name="slaId">
            <option value="0" selected="selected">&mdash; <?php echo __('System Default');?> &mdash;</option>
            <?php
                    if($slas=SLA::getSLAs()) {
                        foreach($slas as $id =>$name) {
                            echo sprintf('<option value="%d" %s>%s</option>',
                                    $id, ($info['slaId']==$id)?'selected="selected"':'',$name);
                        }
                    }
                    ?>
          </select>
          &nbsp;<font class="error">&nbsp;<?php echo $errors['slaId']; ?></font>
        </td>
      </tr>
      <tr>
        <td width="160">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Due Date');?>:
        </td>
        <td>
          <?php
               // $duedateField = Ticket::duedateField('duedate', $info['duedate']);
              $query = sprintf("SELECT duedate FROM %s WHERE ticket_id = %d", TICKET_TABLE, $ticket->getId());
                $result = db_query($query);
                if ($row = db_fetch_array($result)) {
                    $duedate = $row['duedate'];
                } 
               // $duedateField = Ticket::duedateField('duedate', $info['duedate']);
                $duedateField = Ticket::duedateField('duedate', Misc::db2gmtime($duedate));
                $duedateField->render();
                ?>
          &nbsp;<font class="error">&nbsp;<?php echo $errors['duedate']; ?> &nbsp; <?php echo $errors['time']; ?></font>
          <em><?php echo __('Time is based on your time
                        zone');?>&nbsp;(<?php echo $cfg->getTimezone($thisstaff); ?>)</em>
        </td>
      </tr>

      <?php
        if($thisstaff->hasPerm(Ticket::PERM_ASSIGN, false)) { ?>
      <tr>
        <td width="160">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo __('Assign To');?>:</td>
        <td>
          <select id="assignId" name="assignId">
            <option value="0" selected="selected">&mdash; <?php echo __('Select an Agent OR a Team');?> &mdash;</option>
            <?php
                    $users = Staff::getStaffMembers(array(
                                'available' => true,
                                'staff' => $thisstaff,
                                ));
                    if ($users) {
                        echo '<OPTGROUP label="'.sprintf(__('Agents (%d)'), count($users)).'">';
                        foreach ($users as $id => $name) {
                            $k="s$id";
                            echo sprintf('<option value="%s" %s>%s</option>',
                                        $k, (($info['assignId']==$k) ? 'selected="selected"' : ''), $name);
                        }
                        echo '</OPTGROUP>';
                    }

                    if(($teams=Team::getActiveTeams())) {
                        echo '<OPTGROUP label="'.sprintf(__('Teams (%d)'), count($teams)).'">';
                        foreach($teams as $id => $name) {
                            $k="t$id";
                            echo sprintf('<option value="%s" %s>%s</option>',
                                        $k,(($info['assignId']==$k)?'selected="selected"':''),$name);
                        }
                        echo '</OPTGROUP>';
                    }
                    ?>
          </select>&nbsp;<span class='error'>&nbsp;<?php echo $errors['assignId']; ?></span>
        </td>
      </tr>
      <tr>
        <td width='160'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Carrier:</td>
        <td><input type="text" size="50" name="carrier" id="carrier" value="<?php echo $info['carrier']; ?>"></td>
      </tr>

      <tr>
        <td width='160'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Carrier Ref:</td>
        <td><input type="text" size="50" name="carrier_ref" id="carrier_ref" value="<?php echo $info['carrier_ref']; ?>"></td>
      </tr>
      <!-- <tr>
        <td width='160'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Issue Summary:</td>
        <td><input type="text" size="50" name="issue" id="issue" value="<?php echo $info['subject']; ?>"></td>
      </tr> -->
      <?php } ?>
    </tbody>

</table>
 <table class="form_table dynamic-forms" width="940" border="0" cellspacing="0" cellpadding="2">
        <?php if ($forms)
            foreach ($forms as $form) {
               // var_dump($form);
                $form->render(true, false, array('mode'=>'edit','width'=>160,'entry'=>$form));
        } ?>
</table> 
<table class="form_table" width="940" border="0" cellspacing="0" cellpadding="2">
    <tbody>
        <tr>
            <th colspan="2">
                <em><strong><?php echo __('Internal Note');?></strong>: <?php echo __('Reason for editing the ticket (optional)');?> <font class="error">&nbsp;<?php echo $errors['note'];?></font></em>
            </th>
        </tr>
        <tr>
            <td colspan="2">
                <textarea class="richtext no-bar" name="note" cols="21"
                    rows="6" style="width:80%;"><?php echo Format::viewableImages($info['note']);
                    ?></textarea>
            </td>
        </tr>
    </tbody>
</table>

<br/>
<ul id="threads">
			<li ><a class="active" id="toggle_ticket_thread">Billing & Parts</a></li>
		</ul>	
		
		<br/>
<div id="div_style">
			<table id="myTable" bgcolor="#F8F8F8" width="100%" border="1" cellspacing="0">
			  <tr>
				<th align="center" width="10%"><font color="#0066CC">Code</font></th>
				<th align="center" width="5%"><font color="#0066CC">Qty</font></th>
				<th align="center" width="65%"><font color="#0066CC">Description</font></th>
				<th align="center" width="10%"><font color="#0066CC">Unit Price</font></th>
				<th align="center" width="10%"><font color="#0066CC">Total</font></th>
			  </tr>
			  
			 
			  
			<?php				
				$rows = array();
				for($j=1;$j<=$bill_rows;$j++){
					$rows = mysql_fetch_array($bill_query);
					echo "<tr>";
					echo "<td align='center'><div contenteditable>".$rows['code']."</div></td>";
					echo "<td align='center'><div contenteditable>".$rows['qty']."</div></td>";
					echo "<td align='left'><div contenteditable>".$rows['description']."</div></td>";
					echo "<td><table width='100%'><tr><td width='1%' align='left'>$</td><td width='9%' align='right'><div contenteditable>".$rows['unit_price']."</div></td></tr></table></td>";
					echo "<td align='center' bgcolor='#CCCCCC'><table width='100%'><tr><td width='1%' align='left'>$</td><td width='9%' align='right'>".$rows['total_price']."</td></tr></table></td>";
					echo "</tr>";
				}
			?>
			
			</table>
			
			
			
			<table id='fixed_table' bgcolor="#F8F8F8" width="100%" border="1" cellspacing="0">
			<tr>
				<td align="center" width="10%" bgcolor="#DDDDDD">&nbsp;</td>
				<td align="center" width="5%" ><div contenteditable><?php echo $rows['labour_qty'];?>&nbsp;</div></td>
				<td align="right" width="65%" bgcolor="#DDDDDD"><font color="#0066CC">Labour Charge</font></td>
				<td ><table width="100%"><tr><td width="1%" align="left">$</td><td width="9%" align="right"><div contenteditable><?php echo number_format($rows['labour_charge'],2);?></div></td></tr></table></td>
				<?php $labtot = $rows['labour_qty'] * $rows['labour_charge']; ?>
				<td align="center" width="10%" bgcolor="#DDDDDD"><table width='100%'><tr><td width='1%' align='left'>$</td><td width="9%" align="right"><?php echo number_format($rows['labour_total'],2);?></td></tr></table></td>
			</tr>
			
			<tr>
				<td align="center" width="10%" bgcolor="#DDDDDD">&nbsp;</td>
				<td align="center" width="5%" ><div contenteditable><?php echo $rows['onsite_callout_fee_qty'];?>&nbsp;</div></td>
				<td align="right" width="65%" bgcolor="#DDDDDD"><font color="#0066CC">Onsite Call Out Fee</font></td>
				<td ><table width="100%"><tr><td width="1%" align="left">$</td><td width="9%" align="right"><div contenteditable><?php echo number_format($rows['onsite_callout_fee'],2);?></div></td></tr></table></td>
				<?php $ontot = $rows['onsite_callout_fee_qty'] * $rows['onsite_callout_fee']; ?>
				<td align="center" width="10%" bgcolor="#DDDDDD"><table width='100%'><tr><td width='1%' align='left'>$</td><td width="9%" align="right"><?php echo number_format($rows['onsite_total'],2);?></td></tr></table></td>
			</tr>
		</table>
			
			<div align="right">
		<table id='final_table' bgcolor="#F8F8F8" width="20%">
			<tr>
				<td bgcolor="#F5FFFF" align="right" width="50%"><font color="#0066CC">Net</font></td>
				<td style="border: 1px solid black;" align="right" width="50%" bgcolor="#DDDDDD"><font color="#0066CC"><table width='100%' align='center'><tr><td width='1%' align='left'>$</td><td width='9%' align='right'><?php echo number_format($rows['net'],2);?></td></tr></table></font></td>
			</tr>
			
			<tr>
				<td bgcolor="#F5FFFF" align="right" width="50%"><font color="#0066CC">GST</font></td>
				<td style="border: 1px solid black;" align="right" width="50%" bgcolor="#DDDDDD"><font color="#0066CC"><table width='100%' align='center'><tr><td width='1%' align='left'>$</td><td width='9%' align='right'><?php echo number_format($rows['gst'],2);?></td></tr></table></font></td>
			</tr>
			
			<tr>
				<td bgcolor="#F5FFFF" align="right" width="50%"><font color="#00CCCC">Total</font></td>
				<td style="border: 1px solid black;" align="right" width="50%" bgcolor="#DDDDDD"><font color="#0099CC"><table align='center' width='100%'><tr><td width='1%' align='left'>$</td><td align='right' width='9%'><?php echo number_format($rows['grand_total'],2);?></td></tr></table></font></td>
			</tr>
			
			
		</table>
	</div>
			
			</div>
		
		
		<br/>
<div align="right">
<button type="button" onclick="window.location.reload()">Reload</button>
<button type="button" onclick="displayResult()">Add row</button>
<button type="button" onClick="updateTable()">Update</button>
</div>

<p style="text-align:center;">
    <input type="submit" name="submit" value="<?php echo __('Save');?>" onclick="createInput()">
    <input type="reset"  name="reset"  value="<?php echo __('Reset');?>">
    <input type="button" name="cancel" value="<?php echo __('Cancel');?>" onclick='window.location.href="tickets.php?id=<?php echo $ticket->getId(); ?>"'>
</p>
</form>
<div style="display:none;" class="dialog draggable" id="user-lookup">
    <div class="body"></div>
</div>
<script type="text/javascript">
+(function() {
  var I = setInterval(function() {
    if (!$.fn.sortable)
      return;
    clearInterval(I);
    $('table.dynamic-forms').sortable({
      items: 'tbody',
      handle: 'th',
      helper: function(e, ui) {
        ui.children().each(function() {
          $(this).children().each(function() {
            $(this).width($(this).width());
          });
        });
        ui=ui.clone().css({'background-color':'white', 'opacity':0.8});
        return ui;
      }
    });
  }, 20);
})();
</script>
