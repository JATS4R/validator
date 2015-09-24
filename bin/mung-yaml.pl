#!/usr/bin/env perl

use YAML qw(Load Dump Bless);
use Data::Dumper;

my $jats_schema = Load(do {
    local $/ = undef;
    open my $F, "<", 'jats-schema.yaml' or return 0;
    <$F>;
});

my @schema;
my $new_yaml = {
    'schema' => \@schema,
};

foreach my $s (@{$jats_schema->{dtds}}) {
    my $new_s = {};
    my $fpi = $s->{fpi};
    my $name = $fpi;
    $name =~ s{-//[^/]+//\S+\s+(.*?)\s+\d+//EN}{$1};
    $new_s->{name} = $name;
    $new_s->{fpi} = $fpi;
    $new_s->{repo} =
        $fpi =~ m{^-//NLM//DTD JATS} 
            ? "https://github.com/ncbi/niso-jats"
            : "https://github.com/ncbi/nlm-dtd";
    #print "fpi = $fpi\n" . $new_s->{repo} . "\n";

    $path = $s->{path};
    $path =~ m{(.*?)/((dtd|oasis-dtd)/.*)};
    $repo_base_path = $1;
    $dtd_repo_path = $2;
    #print "repo_base_path; '$repo_base_path'\n" .
    #      "  dtd_repo_path: '$dtd_repo_path'\n";
    $new_s->{repo_base_path} = $repo_base_path;
    $new_s->{dtd} = {
        'sysid' => $s->{system_id},
        'repo_path' => $dtd_repo_path,
    };

    $rng_repo_path = $dtd_repo_path;
    $rng_repo_path =~ s/dtd/rng/g;
    $new_s->{rng} = {
        'uri' => $s->{rng},
        'repo_path' => $rng_repo_path,
    };

    $xsd_repo_path = $dtd_repo_path;
    $xsd_repo_path =~ s/dtd/xsd/g;
    $new_s->{xsd} = {
        'uri' => $s->{xsd},
        'repo_path' => $xsd_repo_path,
    };
    push @schema, $new_s;
    #Bless($new_s)->keys(
    #    ['name', 'fpi', 'repo', 'repo_base_path', 'dtd', 'rng', 'xsd']);
}

#print Dumper($jats_schema);
$new_yaml;
print Dump($new_yaml);
