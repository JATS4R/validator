#!/usr/bin/env perl

use YAML qw(Load Dump Bless);
use Data::Dumper;

my @nlm_schema = [];
my %nlm_schema_hash = (
    "uri_prefix" => 'http://dtd.nlm.nih.gov/',
    'repo' => 'https://github.com/ncbi/nlm-dtd',
    'schemas' => \@nlm_schema,
);
my @niso_schema = [];
my %niso_schema_hash = (
    "uri_prefix" => 'http://jats.nlm.nih.gov/',
    'repo' => 'https://github.com/ncbi/niso-jats',
    'schemas' => \@niso_schema,
);
my $new_yaml = [\%nlm_schema_hash, \%niso_schema_hash];



my $jats_schema = Load(do {
    local $/ = undef;
    open my $F, "<", 'jats.yaml' or exit 1;
    <$F>;
});

foreach my $s (@{$jats_schema->{schema}}) {
    my $new_s = {
        'dtd_sysid' => $s->{dtd}{sysid},
        'fpi' => $s->{fpi},
        'name' => $s->{name},
        'rng_uri' => $s->{rng}{uri},
        'xsd_uri' => $s->{xsd}{uri},
    };
    if ($s->{repo} eq 'https://github.com/ncbi/nlm-dtd') {
        push @nlm_schema, $new_s;
    }
    else {
        push @niso_schema, $new_s;
    }
}

#print Dumper($jats_schema);
$new_yaml;
print Dump($new_yaml);
