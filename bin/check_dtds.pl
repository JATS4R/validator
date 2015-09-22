#!/usr/bin/env perl

# This script reads the existing dtd.yaml file, which (before) did not have any references
# to RNG or XSD versions of the schema files. It attempts to construct those URLs, based
# on the system identifier. It then tried to do an HTTP request to see if the URL was
# dereferenceable, and prints out a message if not.  It then dumps the new version of the
# dtd.yaml file.

use strict; 
use YAML;
use LWP::UserAgent;

my $ua = LWP::UserAgent->new;
$ua->timeout(10);

my $dtds_yaml = do {
    local $/ = undef;
    open my $file, "<", '../dtds.yaml'
        or return 0;
    <$file>;
};
my ($dtds) = Load($dtds_yaml);

foreach my $dtd (@{$dtds->{dtds}}) {
    my $sysid = $dtd->{system_id};
    #$sysid = 'http://dtd.nlm.nih.gov/archiving/3.0/archivearticle3.dtd';
    if ($sysid =~ 
        m{ ( http:// (jats|dtd) \.nlm\.nih\.gov/ 
             (articleauthoring|publishing|archiving)/
             \d\.\d(d\d)?/ )
           ( ([^.]+)\. )
           dtd
         }x)
    {
        my ($start, $basename) = ($1, $5);
        my $rng = $start . "rng/" . $basename . "rng";
        my $xsd = $start . "xsd/" . $basename . "xsd";

        if (try_resolve($rng)) {
            $dtd->{rng} = $rng;
        }
        if (try_resolve($xsd)) {
            $dtd->{xsd} = $xsd;
        }
    }
}

print Dump($dtds);


sub try_resolve {
    my $url = shift;
    my $response = $ua->get($url); 
    if (!$response->is_success) {
        print "Failed to resolve '$url'\n";
        return 0;
    }
    return 1;
}