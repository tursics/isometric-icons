function firstN(list, n){
	counter = 0
	result = []
	for(item of list){
		result.push(item)
		counter++
		if(counter==n) break
	}
	return result
}

function guessStation(input){
    query = input.val()
    $.ajax({
        url: 'https://transport.rest/locations?query='+query,
        dataType: 'json',
        success: function(res){
            console.log(res[0].id)
            if(res.length>0){
                if(!input.next('input').attr('value')){
                  input.attr('value', res[0].id)
                  input.val(res[0].name)
                }
            }
            else{
                input.val(null);
            }
        },
        error: function(data){
            input.val(query)
        }
    })
}

function getRoute(from, to){
	 $.ajax({
        url: 'https://transport.rest/routes?from='+from+'&to='+to,
        dataType: 'json',
        success: function(res){
            console.log(res)
        },
        error: function(data){
            console.log('Fehler beim Abfragen der Routendaten.')
        }
    })
}

function addAutocomplete(sel){
$(sel).autocomplete({
  serviceUrl: 'https://transport.rest/locations',
  paramName: 'query',
  params: {
  	results: 40
  },
  minChars: 3,
  transformResult: function(response) {
    return {
      suggestions: $.map(firstN(_.filter($.parseJSON(response), (o) => (o.products && (o.products.subway||o.products.suburban))), 5), function(dataItem) {
        return { value: dataItem.name, data: dataItem.id}
      })
    }
  },
  onSelect: function(suggestion) {
    $(sel).attr('value', suggestion.data);
    if(sel=="#from-station") $('#to-station').focus()
    else $('#submit').focus()
  }
})
}

addAutocomplete('#from-station')
addAutocomplete('#to-station')

$('.station').focusout(function(){
    if(!$(this).attr('value')){
        guessStation($(this));
    }
})

$('#submit').click(() => {
	if(!+$('#from-station').attr('value')||!+$('#to-station').attr('value')) console.log('Bitte geben Sie einen gültigen Start- und Zielbahnhof an.')
	else{
		from = +$('#from-station').attr('value')
		to = +$('#to-station').attr('value')
		getRoute(from, to)
	}
})