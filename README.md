# DKcast

Today's and tomorrow's hourly temperature, sunshine, rain and wind at Danish weather stations, by Bolgaç Gülen. Page: https://bolgacg.github.io/dkcast/

From 7 November 2026, each day's forecast is locked with a SHA-256 hash at 10:30 and the numbers appear after 12:05, because this model will be entering competitions. `forecasts/<day>.sha256` holds the hash and `forecasts/<day>.json` the numbers. Check a day with `sha256sum -c <day>.sha256` inside `forecasts/`, and read the commit times of both files.

The forecast code is private.
