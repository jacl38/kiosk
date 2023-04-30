function formatMoney(money: number) {
	const rounded = money.toFixed(2);
	return `$${rounded}`;
}