<?php get_header(); ?>

      <div id="content">

        <div id="inner-content" class="wrap cf">

            <div id="main" class="m-all t-2of3 d-5of7 cf" role="main">

              <?php
require_once(__DIR__ . '/client/GitHubClient.php'); ?>




<?php $args = array( 'post_type' => 'projects', 'posts_per_page' => 100 );
$loop = new WP_Query( $args );
while ( $loop->have_posts() ) : $loop->the_post(); ?>
  <?php the_title(); ?>
  <div class="entry-content">

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
<?php endwhile; wp_reset_query(); ?>



            </div>

            <?php //get_sidebar(); ?>

        </div>

      </div>

<?php get_footer(); ?>
