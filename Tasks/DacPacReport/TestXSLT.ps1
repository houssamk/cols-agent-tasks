function Convert-ReportToHtml {
    param(
        [string]$ReportPath = "./SchemaCompare/SchemaCompare.xml"
    )

    Write-Verbose -Verbose "Converting report $reportPath to md"
    $xslXml = [xml](gc ".\report-transformToMd.xslt")
    $reportXml = [xml](gc $reportPath)

    $xslt = New-Object System.Xml.Xsl.XslCompiledTransform
    $xslt.Load($xslXml)
    $stream = New-Object System.IO.MemoryStream
    $xslt.Transform($reportXml, $null, $stream)
    $stream.Position = 0
    $reader = New-Object System.IO.StreamReader($stream)
    $text = $reader.ReadToEnd()

    Write-Verbose -Verbose "Writing out transformed report to deploymentReport.md"
    sc -Path "SchemaCompare\deploymentReport.md" -Value $text
}

Convert-ReportToHtml