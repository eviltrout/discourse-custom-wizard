import { default as discourseComputed } from 'discourse-common/utils/decorators';
import { scheduleOnce } from "@ember/runloop";
import Controller from "@ember/controller";

export default Controller.extend({
  title: 'admin.wizard.after_time_modal.title',

  setup() {
    const dateTime = this.get('model.dateTime');
    const ROUNDING = 30 * 60 * 1000;
    const nextInterval = moment(Math.ceil((+moment()) / ROUNDING) * ROUNDING);
    const mDateTime = dateTime ? moment(dateTime) : nextInterval;
    const mDateTimeLocal = mDateTime.local();
    const date = mDateTimeLocal.format('YYYY-MM-DD');
    const time = mDateTimeLocal.format('HH:mm');

    this.setProperties({ date, time });

    scheduleOnce('afterRender', this, () => {
      const $timePicker = $("#time-picker");
      $timePicker.timepicker({ timeFormat: 'H:i' });
      $timePicker.timepicker('setTime', time);
      $timePicker.change(() => this.set('time', $timePicker.val()));
    });
  },

  @discourseComputed('date', 'time')
  dateTime: function(date, time) {
    return moment(date + 'T' + time).format();
  },

  @discourseComputed('dateTime')
  submitDisabled(dateTime) {
    return moment().isAfter(dateTime);
  },

  resetProperties() {
    this.setProperties({
      date: null,
      time: null
    });
  },

  actions: {
    clear() {
      this.resetProperties();
      this.get('model.update')(null);
    },

    submit() {
      const dateTime = this.get('dateTime');
      const formatted = moment(dateTime).utc().toISOString();
      this.get('model.update')(formatted);
      this.resetProperties();
      this.send("closeModal");
    }
  }
});
