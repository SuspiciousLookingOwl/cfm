<script lang="ts">
	import { Table } from "@components";
	import type { PlayerEntity } from "@entities";
	import { thousandSeparator, toPercentage } from "@utils";
	import { _ } from "svelte-i18n";
	import { StatsTableRow } from "..";

	export let profile: PlayerEntity;

	$: headers = [
		{
			key: "mode",
			label: $_("profile.mode"),
		},
		{
			key: "score",
			label: $_("profile.score"),
			format: thousandSeparator,
		},
		{
			key: "up",
			label: $_("profile.up"),
		},
		{
			key: "ratio",
			label: $_("profile.ratio"),
			format: toPercentage,
		},
	];
	$: data = [
		{
			mode: $_("stats.roundsPlayed"),
			score: profile.stats.racing.rounds,
			up: profile.period.racing.rounds,
			icon: "/img/icon/racing_rounds.png",
		},
		{
			mode: $_("stats.roundsCompleted"),
			score: profile.stats.racing.finished,
			up: profile.period.racing.finished,
			ratio: profile.stats.ratio.racing.finished,
			icon: "/img/icon/racing_finished.png",
		},
		{
			mode: $_("stats.numberOfPodiums"),
			score: profile.stats.racing.podium,
			up: profile.period.racing.podium,
			ratio: profile.stats.ratio.racing.podium,
			icon: "/img/icon/racing_podium.png",
		},
		{
			mode: $_("stats.numberOfFirsts"),
			score: profile.stats.racing.first,
			up: profile.period.racing.first,
			ratio: profile.stats.ratio.racing.first,
			icon: "/img/icon/racing_first.png",
		},
	];
</script>

<Table {headers} {data} title={$_("stats.racing")}>
	<svelte:fragment slot="row" let:row>
		<StatsTableRow {headers} {row} />
	</svelte:fragment>
</Table>
