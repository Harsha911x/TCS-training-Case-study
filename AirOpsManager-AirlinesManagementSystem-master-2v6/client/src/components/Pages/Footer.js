import React from 'react'

const Footer = () => {
  return (
    <div style={{marginTop:"10%"}}>
    <footer className="bg-dark text-center text-white">
      <div className="container p-4">

        <section className="">
          <form action="">
            <div className="row d-flex justify-content-center">

              <div className="col-auto">
                <button type="submit" className="btn btn-outline-light mb-4">
                  Where Luxury meets Class
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="mb-4">
          <p>
            <b>"Come Fly with StarJet Airlines"</b>
          </p>
        </section>

      </div>
      <div className="text-center p-3" style={{backgroundColor: "rgba(0, 0, 0, 0.2)"}}>
        © 2025 Copyright: All rights are reserved!
      </div>
    </footer>
    </div>
  )
}

export default Footer