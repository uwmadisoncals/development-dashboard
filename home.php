<?php get_header(); ?>

			<div id="content" class="wrap">

				<div id="inner-content" class="cf">

						<div id="main" class="m-all cf" role="main">

								<?php
	require_once(__DIR__ . '/client/GitHubClient.php'); ?>




	<?php $args = array( 'post_type' => 'projects', 'posts_per_page' => 100 );
	$loop = new WP_Query( $args );
	while ( $loop->have_posts() ) : $loop->the_post(); ?>

		<div class="cardContainer">

			<?php

		if( function_exists('get_field') && get_field('screenshot') ):
			$attachment_id = get_field('screenshot'); $size = "medium";
			$image = wp_get_attachment_image_src($attachment_id, $size);

			echo "<div class='dateCircle'>Apr<span>14</span></div>";
			echo "<div class='screenshotContainer'><img class='screenshot' src='".$image[0]."' alt=' ' ></div>";

	endif; ?>

		<div class="entry-content">

		<h2><?php the_title(); ?></h2>


			<?php $owner = get_field('github_organization');
			$repo = get_field('github_repository');


			$client = new GitHubClient();

			$client->setPage();
			$client->setPageSize(10);
			$commits = $client->repos->commits->listCommitsOnRepository($owner, $repo); ?>



			<?php

			//echo "Count: " . count($commits) . "\n";
			$hash = $commits[0]->getSha();
			
			//$hash = $singlecommit->getSha();
			echo "<div class='hashLabel'>Latest Commit</div><a href='http://github.com/".$owner."/".$repo."/commit/".$hash."' class='hashLink'>".$hash."<div class='hashFade'></div></a><div class='hashArrow'><svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 109.6 115.1' enable-background='new 0 0 109.6 115.1' xml:space='preserve'><polygon fill='#AE3424' points='0,0 0,115.1 109.6,0 '/></svg></div>";

			?>
			<div class="description">
					<?php the_content(); ?>
			</div>
		</div>
	</div>
	<?php endwhile; wp_reset_query(); ?>



						</div>

					<?php //get_sidebar(); ?>

				</div>

			</div>


<?php get_footer(); ?>
