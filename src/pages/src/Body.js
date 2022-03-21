import React from 'react';
import SimpleGraph from '../../component/Graph';
import '../style/Body.css';

const Body = () => {
    return ( 
        <>
            <div className='content-graph'>
                <SimpleGraph />
            </div>
		</>
     );

}
 
export default Body;