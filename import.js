$(function() {
    $('select.municipality, select.city').select2({
        language: 'lt',
        width: '100%',
        ajax: {
            url: 'https://postit.lt/data/v2/',
            dataType: 'json',
            crossDomain: true,
            delay: 300,
            minimumInputLength: 0,
            cache: true,
            data: function (params) {
                var data = {
                    page : (params.page || 1),
                    limit: 10,
                    key: 'ROQetlBQcc0EvWoYxBt6'
                };
                var key = $(this).data('key');
                var query = (typeof params.term === 'undefined') ? '' : params.term;

                if(key === 'municipality'){
                    data['group'] = 'municipality';
                    data['municipality'] = query;
                }
                else if(key === 'city'){
                    data['group'] = 'city';
                    data['municipality'] = $('select.municipality').val();
                    data['city'] = query;
                }

                return data;
            },
            processResults: function (response) {
                var key = $(this.$element).data('key');
                var data = $.map(response.data, function(item) {
                    return {
                        text: item[key],
                        id: item[key]
                    };
                });

                if ( !response.success ){
                    alert(response.message);
                }

                return {
                    results: data,
                    pagination: {
                        more: response.page.current < response.page.total
                    }
                };
            }
        }
    })
        .on('select2:selecting', function(e, action){
            var key = $(this).data('key');

            if(key === 'municipality'){
                if($('.item.city').is(':visible')){
                    $('select.city').val('').trigger('change');
                    $('.item.address, .item.zipcode').hide();
                }
                else {
                    $('.item.city').show();
                }
            }
            else if(key === 'city'){
                $('div.item').show();
            }

            //Do not clear inputs if restoring values
            if(action !== 'skip_clear'){
                $('input.address, input.zipcode').val('');
            }
        });

    //Restore submited values
    $('select.select2').each(function(){
        var value = $(this).data('value');
        if(typeof value === 'string' && value !== ''){
            var $option = $('<option selected="selected"></option>').text(value).val(value);
            $(this).append($option).trigger('change').trigger('select2:selecting', ['skip_clear']);
        }
    });

    var address_xhr;
    $('#address').autocomplete({
        minLength: 2,
        delay: 300,
        source: function(request, response){
            //'is_apartment' and 'apartment' are optional: only for checking if address query has apartment information
            var is_apartment = (/\d+\s*[A-Z]*\s*\-+\s*(\d*|\d+\s*[A-Z]*)$/i.test(request.term));
            var apartment = request.term.match(/\d+\s*[A-Z]*\s*\-+\s*(\d*|\d+\s*[A-Z]*)$/i);

            var element = this.element;
            $(element).addClass('loading');

            if(address_xhr){
                address_xhr.abort();
            }
            address_xhr = $.ajax({
                url: 'https://postit.lt/data/v2/',
                dataType: 'json',
                crossDomain: true,
                data: {
                    municipality: $('select.municipality').val(),
                    city: $('select.city').val(),
                    address: $.trim(request.term),
                    wide_number: (is_apartment ? 0 : 1),
                    limit: 20,
                    key: 'postit.lt-examplekey'
                },
                success: function(resp){
                    var r = [];
                    if ( !resp.success ){
                        alert(resp.message);
                        response(r);
                        return;
                    }

                    for( var i = 0, l = resp.data.length; i < l; i++ ){
                        var value = resp.data[i].address;

                        if(is_apartment){
                            value += '-'+apartment[1];
                        }

                        r.push({
                            label: value + (resp.data[i].company === '' ? '' : ' ('+resp.data[i].company+')'),
                            value: value,
                            post_code: resp.data[i].post_code
                        });
                        response(r);
                    }

                },
                error: function(){
                    response([]);
                },
                complete: function(){
                    $(element).removeClass('loading');
                }
            });
        },
        select: function(event, ui){
            $('#zipcode').val('LT-'+ui.item.post_code);
            $('#address').val(ui.item.value);
        }
    });
});