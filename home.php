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


			echo "<img class='screenshot' src='".$image[0]."' alt=' ' >";

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
			echo "<a href='http://github.com/".$owner."/".$repo."/commit/".$hash."'>Latest Commit: ".$hash."</a>";

			?>

		<?php the_content(); ?>
		</div>
	</div>
	<?php endwhile; wp_reset_query(); ?>



						</div>

					<?php //get_sidebar(); ?>

				</div>

			</div>


<?php get_footer(); ?>
