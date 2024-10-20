class WebMonetization {
  constructor() {
    this.isMonetized = false;
    this.totalAmount = 0;
    this.initEventListeners();
  }

  initEventListeners() {
    if (document.monetization) {
      document.monetization.addEventListener('monetizationstart', () => this.onMonetizationStart());
      document.monetization.addEventListener('monetizationprogress', (event) => this.onMonetizationProgress(event));
      document.monetization.addEventListener('monetizationstop', () => this.onMonetizationStop());
    }
  }

  onMonetizationStart() {
    this.isMonetized = true;
    this.updateUI('active');
    console.log('Monetization started');
  }

  onMonetizationProgress(event) {
    const { amount, assetCode, assetScale } = event.detail;
    this.totalAmount += Number(amount);
    this.updateUI('active', this.totalAmount / (10 ** assetScale));
    this.sendPaymentToServer(amount);
  }

  onMonetizationStop() {
    this.isMonetized = false;
    this.updateUI('inactive');
    console.log('Monetization stopped');
  }

  updateUI(status, amount = 0) {
    const statusElement = document.getElementById('monetization-status');
    statusElement.textContent = `Web Monetization: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    if (amount > 0) {
      statusElement.textContent += ` (Total: ${amount.toFixed(assetScale)} ${assetCode})`;
    }
  }

  async sendPaymentToServer(amount) {
    try {
      await axios.post('/api/web-monetization-payment', { amount });
    } catch (error) {
      console.error('Error sending payment to server:', error);
    }
  }
}

const webMonetization = new WebMonetization();
