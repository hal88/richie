const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Gettext = imports.gettext.domain('richie');
const _ = Gettext.gettext;

let msg, text, button, score, visible, error;
let got_score = true, settings;

const GOT_SCORE_KEY = 'got-score';

function clicked() {
    if (visible) {
        Main.uiGroup.remove_actor(msg);
        msg = null;
        score = null;
        visible = false;
    } else {
        error = "";
        score = "";
        try {
            let [res, stdout, stderr, status] = 
                GLib.spawn_command_line_sync('cricket_score Australia');
            score = String(stdout).trim()
            if (!score)
                error = String(stderr).trim();
        } catch (e) {
            error = e.message
        }
        if (score) {
            text = got_score && _(
                "%s").format(score)
                || score;
        } else {
            text = got_score && _(
                "Sorry, no score for you today:\n\n%s").format(error)
                || error;
        }
        msg = new St.Label({style_class: got_score && 'richie-label'
                                                    || 'richie-label-black',
                            text: text});
        Main.uiGroup.add_actor(msg);
        msg.clutter_text.line_wrap = true;
        let monitor = Main.layoutManager.primaryMonitor;
        msg.set_position(
            Math.floor(monitor.width / 2 - msg.width / 2),
            Math.floor(monitor.height / 2 - msg.height / 2));
        visible = true;
    }    
}

function init() {
    Convenience.initTranslations('cricket-score');
    settings = Convenience.getSettings();
    got_score = settings.get_boolean(GOT_SCORE_KEY);
    visible = false;
    button = new St.Bin({style_class: 'panel-button',
                         reactive: true,
                         can_focus: true,
                         x_fill: true,
                         y_fill: false,
                         track_hover: true});
    let gicon = Gio.icon_new_for_string(Me.path + (got_score
                                        && "/icons/bat-bw.svg"));
    let icon = new St.Icon({gicon: gicon});
    button.set_child(icon);
    button.connect('button-press-event', clicked);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
	if (visible) {
        Main.uiGroup.remove_actor(msg);
        msg = null;
        score = null;
        visible = false;
    }
    Main.panel._rightBox.remove_child(button);
}
