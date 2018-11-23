This userscript interfaces with reports at [report.sobotics.org](https://reports.sobotics.org). It's mainly designed to make it easier to find unvisited reports, in addition to hiding newly visited ones (to avoid issues with re-opening the same report multiple times). In addition, it's also designed to avoid having to open all reports of massive batches at once. The instant hiding enables shift-click repeatedly to open any number of reports, then auto-hide them to make the process of opening the next batch easy. 

This is, however, limited. Any previously visited reports are currently not hidden because of a restriction in the attributes that can be used in the `:visited` selector. 

