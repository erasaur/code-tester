Router.route('/:_id', {
  name: 'editor',
  onBeforeAction: function () {
    if (!this.userId) {
      this.redirect('login');
    }
    this.next();
  }
});
