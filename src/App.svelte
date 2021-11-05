<script>
	import Sakums from "./Sakums.svelte";
	import Piesakies from "./Piesakies.svelte";
	import Arhivs from "./Arhivs.svelte";
	import Par from "./Par.svelte";

	export let menu = 1;

	const switchMenu = (e) => {
		menu = e.detail;
	}
</script>

<main>
<div class="header">
	<img src="/logoBalts.svg" alt="FKO"/>
	<h1>Fizikas Komandu Olimpiāde</h1>
	<ul id="menu">
		<li><a href="/" on:click|preventDefault={() => (menu = 1)}>Sākums</a></li> 
		<li><a href="/" on:click|preventDefault={() => (menu = 2)}>Piesakies</a></li>
		<li><a href="/" on:click|preventDefault={() => (menu = 3)}>Arhīvs</a></li>
		<li><a href="/" on:click|preventDefault={() => (menu = 4)}>Par Mums</a></li>
	</ul>
	
</div>
<div class="page">
	{#if menu === 1}
	<Sakums on:switchPie = {switchMenu}/>
	{:else if menu === 2}
	<Piesakies />
	{:else if menu === 3}
	<Arhivs />
	{:else if menu === 4}
	<Par />
	{:else}
	<h1>
		Neatradu lapu...
	</h1>
	{/if}
</div>
</main>

<style>
	.page {
        padding-left: 2vw;
        padding-right: 2vw;
	}

	.header {
		top:0;
		height: 15vh;
		width:100%;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr 3fr 6fr;
		grid-column-gap: 0;
		background-color: #2D0C8A;
	}
	.header img{
		height: 10vh;
		position: relative;
		place-self: center;
	}

	.header h1 {
		font-size: 2vw;
		justify-self: start;
		align-self: center;
	}

	#menu {
		justify-self: center;
		align-self: center;
		position: relative;
	}
	ul#menu li{
		display : inline;
		font-size: 1.5vw;
		color: white;
		padding: 1vw;
	}
	ul#menu li a{
  		text-decoration: none;
		color: white;
		transition-duration: 0.3s;
	}
	ul#menu li a:hover{
		color: rgba(255,255,255,0.6)
	}
	@media (max-width:960px) {
		.header img{
			height: 7vh;
		}
		.header {
			grid-template-columns: 1fr 4fr;
			grid-template-rows: 1fr 1fr;
			height: 20vh;
		}
		#menu {
			grid-column: 1 / span 2;
			align-self: center;
			position: relative;
		}
		ul#menu li{
			font-size: 5vw;

		}
		.header h1 {
			font-size: 5vw;
		}
	}
</style>