#!/bin/bash
hourcnt=$1
cnt=$2
x=1
y=1
zerono=0
nexthour=0
while [ $y -le $hourcnt ]
do 
	echo "Next halfhour: $y out of $hourcnt"
	nexthour=0
	while [ $x -le $cnt ] && [ $nexthour -le $zerono ]
	do
		/usr/local/bin/phantomjs --debug=no --load-images=no /Users/sre/Projects/united-kiosk/do2.js soren@rehne.dk
		OUT=$?
		if [ $OUT -eq 0 ]
		then
			echo "RES: 0"
			x=$(( $x + 1 ))
			sleep 2
		else
			if [ $OUT -eq 1 ]
			then 
				echo "RES: 1"
				nexthour=1
			else
				echo "RES: OTHER result: $OUT"
			fi
		fi
	done

	y=$(( $y + 1 ))

	if [ $y -le $hourcnt ]; then
		echo "Sleep 1 min."
		sleep 60
	fi
done
