<script lang="ts">
	import { Icon, Text } from "@components";

	export let value: number;

	$: classes =
		value > 1000
			? "text-green-300"
			: value > 800
			? "text-green-400"
			: value > 500
			? "text-green-500"
			: "text-green-600";
</script>

{#if value > 0}
	<div class="flex items-center space-x-1 {classes}">
		<Icon name="triangleTop" size="sm" class="fill-current" />
		<Text class=" font-semibold">{value}</Text>
	</div>
{/if}
