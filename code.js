document.addEventListener('DOMContentLoaded', function(){
    let code = `
    def expected_present_value_benefits(dt, term, death_benefit, survival_benefit):
        # dt is a pandas.Series.Series.DataFrame object
        # term is int of float object (in this case 20, 10 or 120)
        # death_benefit and survival_benefit are boleans indicating if the product has the respective benefit
        '''Returns numpy array of expected present value of Benefits for a data frame dt (Product A e.tc) with term term'''
        
        epvs_benefits = [] # for the expected present values of benefits
        
        # create a list of v^i's
        v = [(1+interest)**-i for i in range(1,term+1)] # noting benefits are paid after at least a year
        for index, row in dt.iterrows():
            ages = [] # for annual ages of policyholder over the term 
            qx = [] #for death probabilites over the policy term
            px = [1] #for survival probabilities over the policy term
            
            # note probability of survival at inception is 1 hence the first term in the list
            discount_factors = [] # for the discount factors (including mortality)

            # create a list of ages when the policyholder pays premiums
            ages = [row['Entry Age']+i for i in range(term)]

            # create a list of qx's over the term of the policy
            # that is probabilities of death at integer ages over the term of the contract
            if row['Gender'] == 'Female':
                qx  = [list(female_mortality[female_mortality.age==agg].qx)[0] for agg in ages]
            elif row['Gender'] == 'Male':
                qx  = [list(male_mortality[male_mortality.age==agg].qx)[0] for agg in ages]
            

            # create a list of survival probabilities
            for i in range(len(qx)):
                # px = p(x-1) * (1 - qx) * (1 - lapse.rate)
                px.append(px[i] * (1-qx[i]) * (1 - lapse))
            
            # create as list of deferred probabilities of death ie n|q:x
            nqx = [px[i] * qx[i] for i in range(len(qx))]
        

            # create a list of the discount factors

            discount_factors = [prob * disc for prob, disc in zip(nqx, v)]

            # calculating the assurance factors

            factor = assurance_factors(discount_factors)

            # calculating the EPV of the death benefit
            epv_death_benefits = factor * row['Sum Assured']
            
            #accelerating the claim to the end of the year
            epv_death_benefits = epv_death_benefits * (1+interest)**0.5
            
            # calculate the EPV of the survival benefit
            epv_survival_benefit = row['Sum Assured'] * px[-1]
            
            epv_benefits = 0
            if death_benefit:
                
                if survival_benefit:
                    epv_benefits = epv_death_benefits + epv_survival_benefit
                else:
                    epv_benefits = epv_death_benefits
            else:
                epv_benefits = epv_survival_benefit

            # append to the list
            epvs_benefits.append(epv_benefits)
        
        # create numpy array from the list 
        epvs_benefits = np.array(epvs_benefits)
        
        
        return epvs_benefits

    `
    let index=0;
    let lineCount=1;

    let typed = document.querySelector('#typed');

    function highlightSyntax(code){
        // escape html characters
        let formatted = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // strings 
        //formatted = formatted.replace(/(['"])(.*?)\1/g, '<span class="string">$&</span>');
        // comments
        //formatted = formatted.replace(/(#.*)/g, '<span class="comment">$&</span>');
        // keywords
        const keywords = ['import', 'class', 'def', 'return', 'if', 'else', 'elif', 'from', 'for', 'in', 'while', 'try', 'except', 'print'];
        keywords.forEach(kw => {
            // Look for whole words only
            const regex = new RegExp(`\\b${kw}\\b`, 'g');
            // Avoid replacing inside strings or comments (basic check)
            formatted = formatted.replace(regex, (match) => {
                return `<span class="keyword">${match}</span>`;
            });
        });

        // function definitions
        formatted = formatted.replace(/def\s+(\w+)/g, 'def <span class="function">$1</span>');
        
        // class definitions
        formatted = formatted.replace(/class\s+(\w+)/g, 'class <span class="class-name">$1</span>');

        // numbersx
        formatted = formatted.replace(/\b\d+\b/g, '<span class="number">$&</span>');
        
        // self
        formatted = formatted.replace(/\bself\b/g, '<span class="keyword">self</span>');

        return formatted;
    }

    function writer(){
        if (index < code.length){
            // get substring so far
            const currentCode = code.substring(0, index+1);
            // apply highlighting to the code so far
            typed.innerHTML = highlightSyntax(currentCode);
            index++;

            // random typing speed
            let char = code.charAt(index);
            let delay = Math.random() * 50 + 30;

            if (char === '\n') delay += 150; // pause at end of line
            if (char === ' ') delay -= 10; // fast spaces
            if (Math.random() > 0.95) delay += 200; // occassional thinking pause

            setTimeout(writer, delay);
        }
    }

    // start animation after brief pause

    setTimeout(writer, 1000);
})