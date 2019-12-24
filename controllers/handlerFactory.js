const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = Model => async (req, res) => {

  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(200).json({ msg: 'NO doc with this ID' });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message
    });
  }
};

exports.updateOne = Model => async (req, res) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return res.status(200).json({ msg: 'NO document with this ID' });
    }

    // doc.save()
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message
    });
  }
}; 

exports.createOne = Model => async (req, res) => {
    // console.log(req.body);
  
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          data: doc
        }
      });
    } catch (err) {
      // console.error(err.message);
      res.status(500).json({
        status: 'failed',
        message: err.message
      });
    }
  };

  exports.getOne = (Model, popOption) =>  async (req, res) => {
    try {

        let query =  Model.findById(req.params.id)

        if(popOption) query = query.populate(popOption);

      const doc = await query

      if (!doc) {
        return res.status(200).json({ msg: 'NO document with this ID' });
      }

      res.status(200).json({
        status: 'success',
  
        data: {
          data: doc
        }
      });
    } catch (err) {
      res.status(500).json({
        status: 'failed',
        message: err.message
      });
    }
  };
  

  exports.getAll = Model =>  async (req, res) => {
    try {
        // to get all reviews on a tour (nested route)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

      const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
  
      const doc = await features.query;
      // const doc = await features.query.explain();
  
      //  send response
      res.status(200).json({
        status: 'success',
        results: doc.length,
        requestAt: req.requestTime,
        data: {
          data: doc
        }
      });
    } catch (err) {
      res.status(500).json({
        status: 'failed',
        message: err.message
      });
    }
  };
  
 