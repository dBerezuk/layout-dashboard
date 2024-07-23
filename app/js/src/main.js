const buttonToggleAside = document.querySelector('.head__button');
const aside = document.querySelector('.aside');

buttonToggleAside.addEventListener('click', onButtonToggleAside);

function onButtonToggleAside(e) {
	e.stopPropagation();

	aside.classList.toggle('aside--active');
}

document.addEventListener('click', (e) => {
	if(!e.target.closest('.aside')) {
		aside.classList.remove('aside--active');
	}
});